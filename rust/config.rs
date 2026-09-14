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
    Ok(())
}
