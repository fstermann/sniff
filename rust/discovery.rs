use crate::error::{Result, message};
use globset::{Glob, GlobSet, GlobSetBuilder};
use ignore::WalkBuilder;
use std::{
    collections::BTreeSet,
    path::{Path, PathBuf},
};

fn globs(values: &[String]) -> Result<GlobSet> {
    let mut b = GlobSetBuilder::new();
    for value in values {
        b.add(Glob::new(value).map_err(|e| message(format!("invalid glob {value:?}: {e}")))?);
        if let Some(short) = value.strip_prefix("**/") {
            b.add(Glob::new(short).map_err(|e| message(e.to_string()))?);
        }
    }
    b.build().map_err(|e| message(e.to_string()))
}
pub fn discover(
    raw: &[String],
    profile: &toml::map::Map<String, toml::Value>,
    root: &Path,
) -> Result<Vec<PathBuf>> {
    let values = |k: &str, d: &[&str]| -> Vec<String> {
        profile
            .get(k)
            .and_then(|v| v.as_array())
            .map(|a| {
                a.iter()
                    .filter_map(|x| x.as_str().map(str::to_owned))
                    .collect::<Vec<_>>()
            })
            .unwrap_or_else(|| d.iter().map(|x| x.to_string()).collect::<Vec<_>>())
    };
    let includes = globs(&values("include", &["*"]))?;
    let excludes = globs(&values("exclude", &[]))?;
    let mut found = BTreeSet::new();
    for item in raw.iter().filter(|x| x.as_str() != "-") {
        let path = PathBuf::from(item);
        if !path.exists() {
            return Err(message(format!("no such input: {item}")));
        }
        let path = path.canonicalize().map_err(|e| message(e.to_string()))?;
        if path.is_file() {
            let display = path.strip_prefix(root).unwrap_or(&path);
            if includes.is_match(display) || path.file_name().is_some_and(|x| includes.is_match(x))
            {
                found.insert(path);
            }
            continue;
        }
        for entry in WalkBuilder::new(&path)
            .hidden(false)
            .git_ignore(true)
            .git_global(true)
            .git_exclude(true)
            .build()
        {
            let entry = entry.map_err(|e| message(format!("file discovery failed: {e}")))?;
            if entry.file_type().is_some_and(|t| t.is_file()) {
                let p = entry
                    .into_path()
                    .canonicalize()
                    .map_err(|e| message(e.to_string()))?;
                let display = p.strip_prefix(root).unwrap_or(&p);
                if includes.is_match(display) && !excludes.is_match(display) {
                    found.insert(p);
                }
            }
        }
    }
    Ok(found.into_iter().collect())
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;

    fn profile(include: &[&str], exclude: &[&str]) -> toml::map::Map<String, toml::Value> {
        let mut value = toml::map::Map::new();
        value.insert(
            "include".into(),
            toml::Value::Array(
                include
                    .iter()
                    .map(|x| toml::Value::String((*x).into()))
                    .collect(),
            ),
        );
        value.insert(
            "exclude".into(),
            toml::Value::Array(
                exclude
                    .iter()
                    .map(|x| toml::Value::String((*x).into()))
                    .collect(),
            ),
        );
        value
    }

    #[test]
    fn discovers_matching_files_and_honors_ignores() {
        let temp = tempfile::tempdir().unwrap();
        fs::write(temp.path().join("keep.md"), "keep").unwrap();
        fs::write(temp.path().join("skip.txt"), "skip").unwrap();
        fs::write(temp.path().join("ignored.md"), "ignored").unwrap();
        fs::write(temp.path().join(".gitignore"), "ignored.md\n").unwrap();
        fs::create_dir(temp.path().join(".git")).unwrap();
        let found = discover(
            &[temp.path().display().to_string()],
            &profile(&["*.md", "**/*.md"], &[]),
            temp.path(),
        )
        .unwrap();
        assert_eq!(
            found,
            vec![temp.path().join("keep.md").canonicalize().unwrap()]
        );
    }

    #[test]
    fn explicit_ignored_file_is_included_but_wrong_type_is_not() {
        let temp = tempfile::tempdir().unwrap();
        let markdown = temp.path().join("ignored.md");
        let python = temp.path().join("source.py");
        fs::write(&markdown, "text").unwrap();
        fs::write(&python, "text").unwrap();
        let profile = profile(&["*.md"], &["*"]);
        assert_eq!(
            discover(&[markdown.display().to_string()], &profile, temp.path())
                .unwrap()
                .len(),
            1
        );
        assert!(
            discover(&[python.display().to_string()], &profile, temp.path())
                .unwrap()
                .is_empty()
        );
    }

    #[test]
    fn rejects_missing_inputs_and_invalid_globs() {
        assert!(
            discover(
                &["missing-file".into()],
                &profile(&["*"], &[]),
                Path::new(".")
            )
            .unwrap_err()
            .to_string()
            .contains("no such input")
        );
        assert!(discover(&[], &profile(&["["], &[]), Path::new(".")).is_err());
    }
}
