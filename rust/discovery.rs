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
