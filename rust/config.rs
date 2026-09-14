use crate::{
    error::{Result, message},
    models::Context,
};
use directories::BaseDirs;
use std::{
    env, fs,
    path::{Path, PathBuf},
    process::Command,
};

const DEFAULTS: &str = include_str!("../config/defaults.toml");

fn load(path: &Path) -> Result<toml::Value> {
    let text = fs::read_to_string(path).map_err(|source| crate::error::SniffError::Io {
        path: path.display().to_string(),
        source,
    })?;
    let value: toml::Value = toml::from_str(&text)
        .map_err(|e| message(format!("cannot load config {}: {e}", path.display())))?;
    if value
        .get("version")
        .and_then(|v| v.as_integer())
        .unwrap_or(1)
        != 1
    {
        return Err(message(format!(
            "{}: unsupported config version",
            path.display()
        )));
    }
    Ok(value)
}

pub fn merge(base: &mut toml::Value, overlay: toml::Value) {
    match (base, overlay) {
        (toml::Value::Table(a), toml::Value::Table(b)) => {
            for (k, v) in b {
                if let Some(old) = a.get_mut(&k) {
                    merge(old, v)
                } else {
                    a.insert(k, v);
                }
            }
        }
        (toml::Value::Array(a), toml::Value::Array(b)) => {
            for v in b {
                if !a.contains(&v) {
                    a.push(v);
                }
            }
        }
        (base, value) => *base = value,
    }
}

fn git_root(start: &Path) -> Option<PathBuf> {
    let output = Command::new("git")
        .args([
            "-C",
            &start.to_string_lossy(),
            "rev-parse",
            "--show-toplevel",
        ])
        .output()
        .ok()?;
    output
        .status
        .success()
        .then(|| {
            PathBuf::from(String::from_utf8_lossy(&output.stdout).trim())
                .canonicalize()
                .ok()
        })
        .flatten()
}

fn project_config(start: &Path) -> (Option<PathBuf>, PathBuf) {
    let mut current = if start.is_file() {
        start.parent().unwrap_or(start)
    } else {
        start
    }
    .canonicalize()
    .unwrap_or_else(|_| start.to_path_buf());
    let root = git_root(&current);
    loop {
        let candidate = current.join("sniff.toml");
        if candidate.is_file() {
            return (Some(candidate), current);
        }
        if root.as_ref() == Some(&current) || current.parent().is_none() {
            break;
        }
        current = current.parent().unwrap().to_path_buf();
    }
    (None, root.unwrap_or_else(|| start.to_path_buf()))
}

pub fn load_config(start: &Path, explicit: Option<&Path>) -> Result<Context> {
    let mut data: toml::Value =
        toml::from_str(DEFAULTS).map_err(|e| message(format!("invalid bundled defaults: {e}")))?;
    let global_root = env::var_os("XDG_CONFIG_HOME")
        .map(PathBuf::from)
        .or_else(|| BaseDirs::new().map(|b| b.config_dir().to_path_buf()))
        .unwrap_or_default()
        .join("sniff");
    let global = global_root.join("sniff.toml");
    if global.is_file() {
        merge(&mut data, load(&global)?);
    }
    let (project, project_root) = if let Some(path) = explicit {
        let path = path
            .canonicalize()
            .map_err(|_| message(format!("no such config: {}", path.display())))?;
        (Some(path.clone()), path.parent().unwrap().to_path_buf())
    } else {
        project_config(start)
    };
    if let Some(path) = project {
        merge(&mut data, load(&path)?);
    }
    validate(&data)?;
    Ok(Context {
        data,
        project_root: project_root.canonicalize().unwrap_or(project_root),
        rule_dirs: vec![global_root.join("rules")],
    })
}

fn validate(data: &toml::Value) -> Result<()> {
    let profiles = data
        .get("profiles")
        .and_then(|v| v.as_table())
        .ok_or_else(|| message("config must define at least one profile"))?;
    let default = data
        .get("default_profile")
        .and_then(|v| v.as_str())
        .ok_or_else(|| message("default_profile must be a string"))?;
    if !profiles.contains_key(default) {
        return Err(message(format!(
            "default_profile references unknown profile {default:?}"
        )));
    }
    if crate::models::Severity::parse(
        data.get("fail_on")
            .and_then(|v| v.as_str())
            .unwrap_or("error"),
    )
    .is_none()
    {
        return Err(message("fail_on must be suggestion, warning, or error"));
    }
    for (name, profile) in profiles {
        let profile = profile
            .as_table()
            .ok_or_else(|| message(format!("profiles.{name} must be a table")))?;
        for key in [
            "tags",
            "include",
            "exclude",
            "include_rules",
            "exclude_rules",
        ] {
            if let Some(value) = profile.get(key) {
                if !value
                    .as_array()
                    .is_some_and(|items| items.iter().all(|item| item.is_str()))
                {
                    return Err(message(format!(
                        "profiles.{name}.{key} must be a list of strings"
                    )));
                }
            }
        }
        if let Some(levels) = profile.get("severity") {
            if !levels.as_table().is_some_and(|values| {
                values.values().all(|value| {
                    value
                        .as_str()
                        .and_then(crate::models::Severity::parse)
                        .is_some()
                })
            }) {
                return Err(message(format!(
                    "profiles.{name}.severity contains an invalid level"
                )));
            }
        }
    }
    if let Some(overrides) = data.get("rules") {
        let overrides = overrides
            .as_table()
            .ok_or_else(|| message("rules must be a table"))?;
        for (id, value) in overrides {
            let value = value
                .as_table()
                .ok_or_else(|| message(format!("rules.{id} must be a table")))?;
            if value.get("enabled").is_some_and(|v| !v.is_bool()) {
                return Err(message(format!("rules.{id}.enabled must be true or false")));
            }
            if value.get("severity").is_some_and(|v| {
                v.as_str()
                    .and_then(crate::models::Severity::parse)
                    .is_none()
            }) {
                return Err(message(format!(
                    "rules.{id}.severity contains an invalid level"
                )));
            }
        }
    }
    if let Some(adapters) = data.get("adapters") {
        let adapters = adapters
            .as_table()
            .ok_or_else(|| message("adapters must be a table"))?;
        for (name, value) in adapters {
            let value = value
                .as_table()
                .ok_or_else(|| message(format!("adapters.{name} must be a table")))?;
            if value.get("enabled").is_some_and(|v| !v.is_bool()) {
                return Err(message(format!(
                    "adapters.{name}.enabled must be true or false"
                )));
            }
            if value.get("executable").is_some_and(|v| !v.is_str()) {
                return Err(message(format!(
                    "adapters.{name}.executable must be a string"
                )));
            }
        }
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn recursively_merges_tables_extends_lists_and_replaces_scalars() {
        let mut base: toml::Value =
            toml::from_str("items=['base']\n[nested]\nenabled=true\nseverity='warning'").unwrap();
        let overlay: toml::Value =
            toml::from_str("items=['base','project']\n[nested]\nseverity='error'").unwrap();
        merge(&mut base, overlay);
        assert_eq!(base["items"].as_array().unwrap().len(), 2);
        assert_eq!(base["nested"]["enabled"].as_bool(), Some(true));
        assert_eq!(base["nested"]["severity"].as_str(), Some("error"));
    }

    #[test]
    fn rejects_unknown_default_profile_and_failure_level() {
        let bad_profile: toml::Value =
            toml::from_str("default_profile='missing'\n[profiles.document]").unwrap();
        assert!(
            validate(&bad_profile)
                .unwrap_err()
                .to_string()
                .contains("unknown profile")
        );
        let bad_level: toml::Value =
            toml::from_str("default_profile='document'\nfail_on='fatal'\n[profiles.document]")
                .unwrap();
        assert!(
            validate(&bad_level)
                .unwrap_err()
                .to_string()
                .contains("fail_on")
        );
    }

    #[test]
    fn rejects_malformed_profile_rule_and_adapter_values() {
        for (text, expected) in [
            (
                "default_profile='document'\n[profiles.document]\ninclude='*.md'",
                "list of strings",
            ),
            (
                "default_profile='document'\n[profiles.document]\n[rules.test]\nenabled='yes'",
                "true or false",
            ),
            (
                "default_profile='document'\n[profiles.document]\n[adapters.vale]\nexecutable=42",
                "must be a string",
            ),
        ] {
            let value: toml::Value = toml::from_str(text).unwrap();
            assert!(validate(&value).unwrap_err().to_string().contains(expected));
        }
    }
}
