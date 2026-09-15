use crate::{
    error::{Result, message},
    models::{ReportFinding, Severity},
};
use regex::Regex;
use std::{
    collections::{BTreeMap, BTreeSet},
    fs,
    path::{Path, PathBuf},
};
const WIDTH: usize = 76;
const INDENT: &str = "　　";
fn provenance(s: &str) -> Option<&'static str> {
    match s {
        "vale -> llm confirmed" => Some("Vale → LLM"),
        "ruff -> llm confirmed" => Some("Ruff → LLM"),
        "llm only" => Some("LLM"),
        "vale candidate" => Some("Vale"),
        "ruff candidate" => Some("Ruff"),
        _ => None,
    }
}
pub fn parse(input: &str, confirmed: bool) -> Result<Vec<ReportFinding>> {
    let mut out = vec![];
    let rule_code = Regex::new(r"^[A-Z]{3}[0-9]{3}$").unwrap();
    for (number, line) in input.lines().enumerate() {
        if line.trim().is_empty() {
            continue;
        }
        let f: ReportFinding = serde_json::from_str(line).map_err(|e| {
            message(format!(
                "invalid report JSON on input line {}: {e}",
                number + 1
            ))
        })?;
        if f.line < 1
            || f.column < 1
            || f.path.is_empty()
            || f.rule.is_empty()
            || f.span.is_empty()
            || f.message.is_empty()
        {
            return Err(message("report finding has invalid required field"));
        }
        if !rule_code.is_match(&f.code) {
            return Err(message(format!(
                "report finding has invalid rule code {:?}",
                f.code
            )));
        }
        if provenance(&f.source).is_none()
            || confirmed && matches!(f.source.as_str(), "vale candidate" | "ruff candidate")
        {
            return Err(message(format!(
                "report finding has invalid source {:?}",
                f.source
            )));
        }
        out.push(f.normalize())
    }
    Ok(out)
}
fn lines(f: &ReportFinding, root: &Path) -> Vec<String> {
    if let Some(x) = &f.source_text {
        return x.lines().map(str::to_owned).collect();
    }
    let p = PathBuf::from(&f.path);
    let p = if p.is_absolute() { p } else { root.join(p) };
    fs::read_to_string(p)
        .map(|x| x.lines().map(str::to_owned).collect())
        .unwrap_or_else(|_| vec![f.span.clone()])
}
fn wrap(text: &str) -> Vec<(usize, String)> {
    if text.is_empty() {
        return vec![(0, String::new())];
    }
    let chars: Vec<char> = text.chars().collect();
    let mut out = vec![];
    let mut start = 0;
    while start < chars.len() {
        let limit = (start + WIDTH).min(chars.len());
        let mut end = limit;
        if limit < chars.len()
            && let Some(i) = chars[start + WIDTH / 2..=limit]
                .iter()
                .rposition(|c| *c == ' ')
        {
            end = start + WIDTH / 2 + i
        }
        out.push((
            start,
            chars[start..end]
                .iter()
                .collect::<String>()
                .trim_end()
                .into(),
        ));
        start = end;
        while start < chars.len() && chars[start] == ' ' {
            start += 1
        }
    }
    out
}
fn excerpt(f: &ReportFinding, root: &Path) -> Vec<String> {
    let all = lines(f, root);
    let idx = f.line - 1;
    let target = all.get(idx).cloned().unwrap_or_else(|| f.span.clone());
    let wrapped = wrap(&target);
    let start = f.column - 1;
    let end = (f.end_column.unwrap() - 1).max(start + f.span.chars().count());
    let mut hits: Vec<_> = wrapped
        .iter()
        .enumerate()
        .filter(|(_, (o, s))| *o < end && *o + s.chars().count().max(1) > start)
        .map(|(i, _)| i)
        .collect();
    if hits.is_empty() {
        hits.push((start / WIDTH).min(wrapped.len() - 1))
    }
    let first = *hits.first().unwrap();
    let last = (*hits.last().unwrap()).min(first + 2);
    let mut rows: Vec<(Option<usize>, String, usize, bool)> = vec![];
    let budget = 3 - (last - first + 1);
    if budget >= 2 && idx > 0 {
        rows.push((Some(idx), all[idx - 1].clone(), 0, false));
    }
    for (n, (offset, text)) in wrapped[first..=last].iter().enumerate() {
        let mut shown = text.clone();
        let mut adjusted = *offset;
        if n == 0 && first > 0 {
            shown = format!("… {shown}");
            adjusted = adjusted.saturating_sub(2)
        }
        if n == last - first && last + 1 < wrapped.len() {
            shown = format!("{} …", shown.trim_end())
        }
        rows.push((
            if n == 0 { Some(f.line) } else { None },
            shown,
            adjusted,
            true,
        ));
    }
    let used = rows
        .iter()
        .filter(|x| x.0.is_some() && !x.1.is_empty())
        .count();
    let mut next = idx + 1;
    while next < all.len() && rows.len().saturating_sub(used) + used < 3 {
        rows.push((
            Some(next + 1),
            all[next].chars().take(WIDTH).collect(),
            0,
            next < f.end_line.unwrap(),
        ));
        next += 1
    }
    let digits = rows
        .iter()
        .filter_map(|x| x.0)
        .max()
        .unwrap_or(f.line)
        .to_string()
        .len();
    let mut out = vec![];
    for (line, text, offset, finding) in rows {
        let marker = if line == Some(f.line) { "›" } else { " " };
        let number = line
            .map(|x| format!("{x:>digits$}"))
            .unwrap_or_else(|| " ".repeat(digits));
        out.push(format!("    │ {marker} {number} │ {text}"));
        if finding {
            let row_start = offset;
            let row_end = row_start + text.chars().count();
            let a = start.max(row_start);
            let b = end.min(row_end);
            if a < b {
                out.push(format!(
                    "    │   {} │ {}{}",
                    " ".repeat(digits),
                    " ".repeat(a - row_start),
                    "^".repeat(b - a)
                ));
            }
        }
    }
    out
}
fn location(f: &ReportFinding, root: &Path, markdown: bool) -> String {
    if f.path == "<stdin>" {
        return format!("<stdin>:{}", f.line);
    }
    let p = PathBuf::from(&f.path);
    let abs = if p.is_absolute() { p } else { root.join(p) }
        .canonicalize()
        .unwrap_or_else(|_| root.join(&f.path));
    let label = abs
        .strip_prefix(root)
        .map(|x| x.display().to_string())
        .unwrap_or_else(|_| f.path.clone());
    if markdown && abs.exists() {
        format!("[{}:{}](<{}:{}>)", label, f.line, abs.display(), f.line)
    } else {
        format!("{}:{}", label, f.line)
    }
}
fn rendered_message(message: &str, markdown: bool) -> String {
    message
        .split('\n')
        .flat_map(|paragraph| wrap(paragraph).into_iter().map(|(_, line)| line))
        .enumerate()
        .map(|(index, line)| {
            let prefix = if index == 0 {
                format!("{INDENT}└── ")
            } else {
                format!("{INDENT}    ")
            };
            if markdown {
                format!("{prefix}*{}*", line.replace('*', "\\*").replace('_', "\\_"))
            } else {
                format!("{prefix}{line}")
            }
        })
        .collect::<Vec<_>>()
        .join("\n")
}
pub fn render(
    findings: &[ReportFinding],
    root: &Path,
    subject: &str,
    markdown: bool,
    color: bool,
) -> String {
    if findings.is_empty() {
        return format!(
            "sniff: no {}{}s",
            if subject == "finding" {
                "confirmed "
            } else {
                ""
            },
            subject
        );
    }
    let files = findings
        .iter()
        .map(|x| &x.path)
        .collect::<BTreeSet<_>>()
        .len();
    let mut out = if markdown {
        format!(
            "```text\n ___ _  _ ___ ___ ___\n/ __| \\| |_ _| __| __|\n\\__ \\ .` || || _|| _|\n|___/_|\\_|___|_| |_|\n\n{} {}{} across {} file{}\n```",
            findings.len(),
            subject,
            if findings.len() == 1 { "" } else { "s" },
            files,
            if files == 1 { "" } else { "s" }
        )
    } else {
        format!(
            " ___ _  _ ___ ___ ___\n/ __| \\| |_ _| __| __|\n\\__ \\ .` || || _|| _|\n|___/_|\\_|___|_| |_|\n\n{} {}{} across {} file{}",
            findings.len(),
            subject,
            if findings.len() == 1 { "" } else { "s" },
            files,
            if files == 1 { "" } else { "s" }
        )
    };
    let mut groups: BTreeMap<(&str, usize), Vec<&ReportFinding>> = BTreeMap::new();
    for f in findings {
        groups.entry((&f.path, f.line)).or_default().push(f)
    }
    for (_, mut items) in groups {
        items.sort_by_key(|x| (x.line, x.column));
        out.push_str("\n\n");
        out.push_str(&location(items[0], root, markdown));
        if markdown {
            out.push_str("  ")
        }
        for f in items {
            let label = format!(
                "[{} {}] {}",
                f.severity.as_str().to_uppercase(),
                f.code,
                f.rule
            );
            let marker = if f.severity == Severity::Error {
                "└── "
            } else {
                INDENT
            };
            if markdown {
                out.push_str(&format!(
                    "\n{marker}**{label}** · *via {}*\n\n```text\n{}\n```\n\n{}",
                    provenance(&f.source).unwrap(),
                    excerpt(f, root).join("\n"),
                    rendered_message(&f.message, true)
                ));
            } else {
                let styled = if color {
                    format!("\x1b[1m{label}\x1b[0m")
                } else {
                    label
                };
                out.push_str(&format!(
                    "\n{marker}{styled} · via {}\n\n{}\n\n{}",
                    provenance(&f.source).unwrap(),
                    excerpt(f, root).join("\n"),
                    rendered_message(&f.message, false)
                ));
            }
        }
    }
    out
}

#[cfg(test)]
mod tests {
    use super::*;

    fn payload(source: &str) -> String {
        format!(
            r#"{{"path":"prompt.md","line":1,"column":1,"rule":"test-rule","code":"TST001","severity":"warning","source":"{source}","span":"Must","message":"Unbounded."}}"#
        )
    }

    #[test]
    fn rejects_bad_json_code_severity_and_unconfirmed_source() {
        assert!(
            parse("not json", true)
                .unwrap_err()
                .to_string()
                .contains("input line 1")
        );
        assert!(
            parse(&payload("vale candidate"), true)
                .unwrap_err()
                .to_string()
                .contains("invalid source")
        );
        let bad_code = payload("llm only").replace("TST001", "bad");
        assert!(
            parse(&bad_code, true)
                .unwrap_err()
                .to_string()
                .contains("rule code")
        );
        let bad_severity = payload("llm only").replace("warning", "fatal");
        assert!(parse(&bad_severity, true).is_err());
    }

    #[test]
    fn defaults_end_positions_and_renders_both_formats() {
        let findings = parse(&payload("llm only"), true).unwrap();
        assert_eq!(findings[0].end_line, Some(1));
        assert_eq!(findings[0].end_column, Some(5));
        let terminal = render(&findings, Path::new("."), "finding", false, false);
        assert!(terminal.contains("[WARNING TST001] test-rule · via LLM"));
        assert!(terminal.contains("^^^^"));
        let markdown = render(&findings, Path::new("."), "finding", true, false);
        assert!(markdown.contains("**[WARNING TST001] test-rule**"));
        assert!(markdown.contains("```text"));
    }

    #[test]
    fn empty_reports_distinguish_candidates_and_findings() {
        assert_eq!(
            render(&[], Path::new("."), "finding", false, false),
            "sniff: no confirmed findings"
        );
        assert_eq!(
            render(&[], Path::new("."), "candidate", false, false),
            "sniff: no candidates"
        );
    }

    #[test]
    fn long_diagnoses_use_a_hanging_indent() {
        let message = "The allowed degree of editing is not defined, so different tools can make materially different changes while claiming to clean the reports lightly.";
        let rendered = rendered_message(message, false);
        let lines: Vec<_> = rendered.lines().collect();
        assert!(lines.len() > 1);
        assert!(lines[0].starts_with("　　└── "));
        assert!(lines[1].starts_with("　　    "));
    }
}
