use crate::{
    error::{Result, message},
    models::{Context, RawRule, Rule, Severity},
};
use include_dir::{Dir, include_dir};
use regex::Regex;
use std::{
    collections::{BTreeMap, BTreeSet},
    fs,
};

static BUNDLED: Dir<'_> = include_dir!("$CARGO_MANIFEST_DIR/rules");

fn parse(source: &str, text: &str, stem: &str) -> Result<Rule> {
    let rest = text
        .strip_prefix("---\n")
        .ok_or_else(|| message(format!("{source}: rule must start with YAML frontmatter")))?;
    let (front, body) = rest
        .split_once("\n---\n")
        .ok_or_else(|| message(format!("{source}: unterminated YAML frontmatter")))?;
    let raw: RawRule = serde_yaml_ng::from_str(front)
        .map_err(|e| message(format!("{source}: invalid YAML: {e}")))?;
    if !Regex::new(r"^[a-z][a-z0-9]*(?:-[a-z0-9]+)+$")
        .unwrap()
        .is_match(&raw.id)
    {
        return Err(message(format!("{source}: invalid rule id {:?}", raw.id)));
    }
    if raw.id != stem {
        return Err(message(format!("{source}: id must equal filename stem")));
    }
    if !Regex::new(r"^[A-Z]{3}[0-9]{3}$")
        .unwrap()
        .is_match(&raw.code)
    {
        return Err(message(format!(
            "{source}: invalid rule code {:?}; expected ABC123",
            raw.code
        )));
    }
    if raw.applies_to.is_empty() {
        return Err(message(format!(
            "{source}: applies_to must be a non-empty string list"
        )));
    }
    if raw.sniffers.is_empty() {
        return Err(message(format!(
            "{source}: sniffers must be a non-empty list"
        )));
    }
    for sniffer in &raw.sniffers {
        if !["llm", "vale", "ruff"].contains(&sniffer.kind.as_str()) {
            return Err(message(format!(
                "{source}: unsupported sniffer {:?}",
                sniffer.kind
            )));
        }
        let required = match sniffer.kind.as_str() {
            "vale" => Some("pattern"),
            "ruff" => Some("rule"),
            _ => None,
        };
        if required.is_some_and(|k| {
            !matches!(
                sniffer.options.get(k),
                Some(serde_yaml_ng::Value::String(_))
            )
        }) {
            return Err(message(format!(
                "{source}: {} sniffer requires {}",
                sniffer.kind,
                required.unwrap()
            )));
        }
    }
    if !raw.llm_exempt && !raw.sniffers.iter().any(|s| s.kind == "llm") {
        return Err(message(format!(
            "{source}: add an llm sniffer or set llm_exempt: true"
        )));
    }
    Ok(Rule {
        id: raw.id,
        code: raw.code,
        name: raw.name,
        family: raw.family,
        applies_to: raw.applies_to,
        severity: raw.severity,
        message: raw.message,
        body: body.trim().into(),
        source: source.into(),
        sniffers: raw.sniffers,
        fix: raw.fix,
        evidence: raw.evidence,
        llm_exempt: raw.llm_exempt,
    })
}

pub fn load(context: &Context) -> Result<BTreeMap<String, Rule>> {
    let mut rules = BTreeMap::new();
    let mut codes = BTreeMap::<String, String>::new();
    for file in BUNDLED
        .files()
        .filter(|f| f.path().extension().is_some_and(|x| x == "md"))
    {
        let source = file.path().display().to_string();
        let text = file.contents_utf8().unwrap();
        let rule = parse(
            &source,
            text,
            file.path().file_stem().unwrap().to_str().unwrap(),
        )?;
        insert(&mut rules, &mut codes, rule)?;
    }
    let project_rules = context.project_root.join(".sniff/rules");
    for directory in context
        .rule_dirs
        .iter()
        .chain(std::iter::once(&project_rules))
    {
        if !directory.is_dir() {
            continue;
        }
        let mut paths: Vec<_> = fs::read_dir(directory)
            .map_err(|e| message(e.to_string()))?
            .filter_map(|e| e.ok().map(|x| x.path()))
            .filter(|p| p.extension().is_some_and(|x| x == "md"))
            .collect();
        paths.sort();
        for path in paths {
            let text = fs::read_to_string(&path)
                .map_err(|e| message(format!("{}: {e}", path.display())))?;
            let rule = parse(
                &path.display().to_string(),
                &text,
                path.file_stem().unwrap().to_str().unwrap(),
            )?;
            insert(&mut rules, &mut codes, rule)?;
        }
    }
    Ok(rules)
}
fn insert(
    rules: &mut BTreeMap<String, Rule>,
    codes: &mut BTreeMap<String, String>,
    rule: Rule,
) -> Result<()> {
    if let Some(old) = rules.get(&rule.id) {
        return Err(message(format!(
            "duplicate rule id {:?}: {} and {}",
            rule.id, old.source, rule.source
        )));
    }
    if let Some(old) = codes.get(&rule.code) {
        return Err(message(format!(
            "duplicate rule code {:?}: {} and {}",
            rule.code, old, rule.source
        )));
    }
    codes.insert(rule.code.clone(), rule.source.clone());
    rules.insert(rule.id.clone(), rule);
    Ok(())
}
fn table<'a>(v: &'a toml::Value, key: &str) -> Option<&'a toml::map::Map<String, toml::Value>> {
    v.get(key)?.as_table()
}
fn strings(v: Option<&toml::Value>) -> BTreeSet<String> {
    v.and_then(|x| x.as_array())
        .into_iter()
        .flatten()
        .filter_map(|x| x.as_str().map(str::to_owned))
        .collect()
}
pub fn selected<'a>(
    all: &'a BTreeMap<String, Rule>,
    data: &toml::Value,
    profile: &str,
) -> Result<Vec<&'a Rule>> {
    let profiles = table(data, "profiles").unwrap();
    let p = profiles
        .get(profile)
        .and_then(|v| v.as_table())
        .ok_or_else(|| {
            message(format!(
                "unknown profile {profile:?}; choose one of: {}",
                profiles.keys().cloned().collect::<Vec<_>>().join(", ")
            ))
        })?;
    let tags = strings(p.get("tags"));
    let include = strings(p.get("include_rules"));
    let exclude = strings(p.get("exclude_rules"));
    let overrides = table(data, "rules");
    let referenced: BTreeSet<_> = include
        .iter()
        .chain(&exclude)
        .chain(overrides.into_iter().flat_map(|x| x.keys()))
        .cloned()
        .collect();
    let unknown: Vec<_> = referenced
        .difference(&all.keys().cloned().collect())
        .cloned()
        .collect();
    if !unknown.is_empty() {
        return Err(message(format!(
            "configuration references unknown rule(s): {}",
            unknown.join(", ")
        )));
    }
    Ok(all
        .values()
        .filter(|r| {
            let o = overrides
                .and_then(|x| x.get(&r.id))
                .and_then(|x| x.as_table());
            if o.and_then(|x| x.get("enabled")).and_then(|x| x.as_bool()) == Some(false) {
                return false;
            }
            let mut yes = tags.contains("*") || r.applies_to.iter().any(|x| tags.contains(x));
            if include.contains(&r.id) {
                yes = true
            };
            if exclude.contains(&r.id) {
                yes = false
            };
            yes
        })
        .collect())
}
pub fn severity(rule: &Rule, data: &toml::Value, profile: &str) -> Result<Severity> {
    let mut s = rule.severity;
    if let Some(x) = data
        .get("profiles")
        .and_then(|x| x.get(profile))
        .and_then(|x| x.get("severity"))
        .and_then(|x| x.get(&rule.id))
        .and_then(|x| x.as_str())
    {
        s = Severity::parse(x)
            .ok_or_else(|| message(format!("{}: invalid effective severity {x:?}", rule.id)))?
    };
    if let Some(x) = data
        .get("rules")
        .and_then(|x| x.get(&rule.id))
        .and_then(|x| x.get("severity"))
        .and_then(|x| x.as_str())
    {
        s = Severity::parse(x)
            .ok_or_else(|| message(format!("{}: invalid effective severity {x:?}", rule.id)))?
    };
    Ok(s)
}
