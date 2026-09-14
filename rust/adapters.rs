use crate::{
    error::{Result, message},
    models::{Context, Finding, Rule},
    rules,
};
use serde_json::Value;
use std::{
    collections::BTreeMap,
    env, fs,
    path::{Path, PathBuf},
    process::Command,
};

const BATCH: usize = 200;
fn executable(ctx: &Context, kind: &str) -> Result<String> {
    let adapter = ctx.data.get("adapters").and_then(|x| x.get(kind));
    if adapter
        .and_then(|x| x.get("enabled"))
        .and_then(|x| x.as_bool())
        == Some(false)
    {
        return Err(message(format!("required adapter {kind:?} is disabled")));
    }
    let name = adapter
        .and_then(|x| x.get("executable"))
        .and_then(|x| x.as_str())
        .unwrap_or(kind);
    if Path::new(name).components().count() > 1 && Path::new(name).is_file() {
        return Ok(name.into());
    }
    let extensions: Vec<String> = env::var("PATHEXT")
        .map(|value| value.split(';').map(str::to_owned).collect())
        .unwrap_or_else(|_| vec![String::new()]);
    let resolved = env::var_os("PATH").and_then(|path| {
        env::split_paths(&path).find_map(|directory| {
            extensions
                .iter()
                .map(|extension| directory.join(format!("{name}{extension}")))
                .find(|candidate| candidate.is_file())
        })
    });
    if let Some(path) = resolved {
        Ok(path.display().to_string())
    } else {
        Err(message(format!(
            "required adapter {kind:?} is unavailable: install {name}"
        )))
    }
}
fn source_line(path: &str, line: usize) -> String {
    fs::read_to_string(path)
        .ok()
        .and_then(|x| x.lines().nth(line.saturating_sub(1)).map(str::to_owned))
        .unwrap_or_default()
}
fn ystr<'a>(r: &'a Rule, kind: &str, key: &str) -> Vec<&'a str> {
    r.sniffers(kind)
        .filter_map(|s| s.options.get(key)?.as_str())
        .collect()
}
pub fn run(
    paths: &[PathBuf],
    selected: &[&Rule],
    ctx: &Context,
    profile: &str,
    fix: bool,
) -> Result<Vec<Finding>> {
    let mut out = run_vale(paths, selected, ctx, profile, fix)?;
    out.extend(run_ruff(paths, selected, ctx, profile, fix)?);
    out.sort_by(|a, b| a.key().cmp(&b.key()));
    Ok(out)
}
fn run_vale(
    paths: &[PathBuf],
    selected: &[&Rule],
    ctx: &Context,
    profile: &str,
    _fix: bool,
) -> Result<Vec<Finding>> {
    let applicable: Vec<_> = selected
        .iter()
        .copied()
        .filter(|r| r.sniffers("vale").next().is_some())
        .collect();
    if applicable.is_empty() || paths.is_empty() {
        return Ok(vec![]);
    }
    let exe = executable(ctx, "vale")?;
    let temp = tempfile::tempdir().map_err(|e| message(e.to_string()))?;
    let style = temp.path().join("styles/Sniff");
    fs::create_dir_all(&style).map_err(|e| message(e.to_string()))?;
    let mut native = BTreeMap::new();
    for r in &applicable {
        let patterns = ystr(r, "vale", "pattern");
        let vale = r.sniffers("vale").next().unwrap();
        let ignorecase = vale
            .options
            .get("ignorecase")
            .and_then(|value| value.as_bool())
            .unwrap_or(true);
        let scope = vale
            .options
            .get("scope")
            .and_then(|value| value.as_str())
            .unwrap_or("text");
        let raw = patterns
            .iter()
            .map(|x| format!("  - {}", serde_yaml_ng::to_string(x).unwrap().trim()))
            .collect::<Vec<_>>()
            .join("\n");
        let level = rules::severity(r, &ctx.data, profile)?.as_str();
        let payload = format!(
            "extends: existence\nmessage: {}\nlevel: {level}\nignorecase: {ignorecase}\nscope: {scope}\nraw:\n{raw}\n",
            serde_yaml_ng::to_string(&r.message).unwrap().trim()
        );
        fs::write(style.join(format!("{}.yml", r.id)), payload)
            .map_err(|e| message(e.to_string()))?;
        native.insert(format!("Sniff.{}", r.id), *r);
    }
    let cfg = temp.path().join(".vale.ini");
    fs::write(
        &cfg,
        "StylesPath = styles\nMinAlertLevel = suggestion\n\n[*]\nBasedOnStyles = Sniff\n",
    )
    .map_err(|e| message(e.to_string()))?;
    let mut found = vec![];
    for batch in paths.chunks(BATCH) {
        let output = Command::new(&exe)
            .args([
                "--no-global",
                "--config",
                &cfg.to_string_lossy(),
                "--output=JSON",
            ])
            .args(batch)
            .output()
            .map_err(|e| message(format!("vale failed: {e}")))?;
        if ![Some(0), Some(1)].contains(&output.status.code()) {
            return Err(message(format!(
                "vale failed ({}): {}",
                output.status,
                String::from_utf8_lossy(&output.stderr).trim()
            )));
        }
        let value: Value = serde_json::from_slice(if output.stdout.is_empty() {
            b"{}"
        } else {
            &output.stdout
        })
        .map_err(|e| {
            message(format!(
                "vale returned invalid JSON: {e}: {}",
                String::from_utf8_lossy(&output.stderr).trim()
            ))
        })?;
        let object = value
            .as_object()
            .ok_or_else(|| message("vale returned an unexpected JSON shape"))?;
        for (filename, alerts) in object {
            for alert in alerts.as_array().into_iter().flatten() {
                let Some(rule) = alert
                    .get("Check")
                    .and_then(|x| x.as_str())
                    .and_then(|x| native.get(x))
                else {
                    continue;
                };
                let line = alert.get("Line").and_then(|x| x.as_u64()).unwrap_or(1) as usize;
                let span = alert.get("Span").and_then(|x| x.as_array());
                let col = span
                    .and_then(|x| x.first())
                    .and_then(|x| x.as_u64())
                    .unwrap_or(1) as usize;
                let end = span
                    .and_then(|x| x.last())
                    .and_then(|x| x.as_u64())
                    .unwrap_or(col as u64) as usize;
                let text = alert
                    .get("Match")
                    .and_then(|x| x.as_str())
                    .filter(|x| !x.is_empty())
                    .map(str::to_owned)
                    .unwrap_or_else(|| {
                        source_line(filename, line)
                            .chars()
                            .skip(col - 1)
                            .take(end - col + 1)
                            .collect()
                    });
                found.push(Finding {
                    path: Path::new(filename)
                        .canonicalize()
                        .unwrap_or_else(|_| PathBuf::from(filename))
                        .display()
                        .to_string(),
                    line,
                    column: col,
                    end_line: line,
                    end_column: end,
                    rule: rule.id.clone(),
                    code: rule.code.clone(),
                    severity: rules::severity(rule, &ctx.data, profile)?,
                    detector: "vale".into(),
                    span: text,
                    message: rule.message.clone(),
                });
            }
        }
    }
    Ok(found)
}
fn run_ruff(
    paths: &[PathBuf],
    selected: &[&Rule],
    ctx: &Context,
    profile: &str,
    fix: bool,
) -> Result<Vec<Finding>> {
    let py: Vec<_> = paths
        .iter()
        .filter(|p| matches!(p.extension().and_then(|x| x.to_str()), Some("py" | "pyi")))
        .collect();
    let mut native = BTreeMap::new();
    for r in selected {
        for code in ystr(r, "ruff", "rule") {
            if native.insert(code, *r).is_some() {
                return Err(message(format!(
                    "ruff rule {code} is registered more than once"
                )));
            }
        }
    }
    if native.is_empty() || py.is_empty() {
        return Ok(vec![]);
    }
    let exe = executable(ctx, "ruff")?;
    let select = native.keys().copied().collect::<Vec<_>>().join(",");
    let mut found = vec![];
    for batch in py.chunks(BATCH) {
        let mut cmd = Command::new(&exe);
        cmd.args(["check", "--output-format=json", "--select", &select]);
        if fix {
            cmd.args(["--fix", "--no-unsafe-fixes"]);
        }
        let output = cmd
            .args(batch)
            .output()
            .map_err(|e| message(format!("ruff failed: {e}")))?;
        if ![Some(0), Some(1)].contains(&output.status.code()) {
            return Err(message(format!(
                "ruff failed ({}): {}",
                output.status,
                String::from_utf8_lossy(&output.stderr).trim()
            )));
        }
        let values: Vec<Value> = serde_json::from_slice(if output.stdout.is_empty() {
            b"[]"
        } else {
            &output.stdout
        })
        .map_err(|e| message(format!("ruff returned invalid JSON: {e}")))?;
        for a in values {
            let Some(rule) = a
                .get("code")
                .and_then(|x| x.as_str())
                .and_then(|x| native.get(x))
            else {
                continue;
            };
            let filename = a["filename"].as_str().unwrap();
            let line = a["location"]["row"].as_u64().unwrap_or(1) as usize;
            let col = a["location"]["column"].as_u64().unwrap_or(1) as usize;
            let el = a["end_location"]["row"].as_u64().unwrap_or(line as u64) as usize;
            let ec = a["end_location"]["column"].as_u64().unwrap_or(col as u64) as usize;
            let text = if line == el {
                source_line(filename, line)
                    .chars()
                    .skip(col - 1)
                    .take(ec.saturating_sub(col))
                    .collect()
            } else {
                a["message"].as_str().unwrap_or("").into()
            };
            found.push(Finding {
                path: Path::new(filename)
                    .canonicalize()
                    .unwrap_or_else(|_| filename.into())
                    .display()
                    .to_string(),
                line,
                column: col,
                end_line: el,
                end_column: ec,
                rule: rule.id.clone(),
                code: rule.code.clone(),
                severity: rules::severity(rule, &ctx.data, profile)?,
                detector: "ruff".into(),
                span: text,
                message: rule.message.clone(),
            });
        }
    }
    Ok(found)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::models::{RawSniffer, Severity};
    use std::{collections::BTreeMap, fs};

    fn context(executable: &Path) -> Context {
        Context {
            data: toml::from_str(&format!(
                "[adapters.ruff]\nexecutable = {:?}",
                executable.display().to_string()
            ))
            .unwrap(),
            project_root: executable.parent().unwrap().to_path_buf(),
            rule_dirs: vec![],
        }
    }

    fn ruff_rule() -> Rule {
        let mut options = BTreeMap::new();
        options.insert(
            "rule".into(),
            serde_yaml_ng::Value::String("PLR1722".into()),
        );
        Rule {
            id: "test-ruff".into(),
            code: "TST001".into(),
            name: "Test".into(),
            family: "test".into(),
            applies_to: vec!["code".into()],
            severity: Severity::Warning,
            message: "Test message.".into(),
            body: "Guidance".into(),
            source: "test".into(),
            sniffers: vec![RawSniffer {
                kind: "ruff".into(),
                options,
            }],
            fix: "safe".into(),
            evidence: String::new(),
            llm_exempt: true,
        }
    }

    #[test]
    fn disabled_and_missing_adapters_are_errors() {
        let disabled = Context {
            data: toml::from_str("[adapters.vale]\nenabled=false").unwrap(),
            project_root: ".".into(),
            rule_dirs: vec![],
        };
        assert!(
            executable(&disabled, "vale")
                .unwrap_err()
                .to_string()
                .contains("disabled")
        );
        let missing = Context {
            data: toml::from_str("[adapters.vale]\nexecutable='definitely-not-an-executable'")
                .unwrap(),
            project_root: ".".into(),
            rule_dirs: vec![],
        };
        assert!(
            executable(&missing, "vale")
                .unwrap_err()
                .to_string()
                .contains("unavailable")
        );
    }

    #[cfg(unix)]
    #[test]
    fn ruff_output_is_normalized_and_safe_fix_flags_are_forwarded() {
        use std::os::unix::fs::PermissionsExt;
        let temp = tempfile::tempdir().unwrap();
        let target = temp.path().join("sample.py");
        let fake = temp.path().join("ruff");
        let marker = temp.path().join("args");
        fs::write(&target, "exit()\n").unwrap();
        fs::write(&fake,format!("#!/bin/sh\nprintf '%s' \"$*\" > {:?}\nprintf '%s\\n' '[{{\"code\":\"PLR1722\",\"message\":\"Use sys.exit\",\"filename\":{:?},\"location\":{{\"row\":1,\"column\":1}},\"end_location\":{{\"row\":1,\"column\":5}}}},{{\"code\":\"F401\",\"filename\":{:?}}}]'\nexit 1\n",marker,target.display().to_string(),target.display().to_string())).unwrap();
        let mut permissions = fs::metadata(&fake).unwrap().permissions();
        permissions.set_mode(0o755);
        fs::set_permissions(&fake, permissions).unwrap();
        let rule = ruff_rule();
        let ctx = context(&fake);
        let findings =
            run_ruff(std::slice::from_ref(&target), &[&rule], &ctx, "code", true).unwrap();
        assert_eq!(findings.len(), 1);
        assert_eq!(findings[0].span, "exit");
        assert_eq!(findings[0].detector, "ruff");
        let args = fs::read_to_string(marker).unwrap();
        assert!(args.contains("--fix"));
        assert!(args.contains("--no-unsafe-fixes"));
    }
}
