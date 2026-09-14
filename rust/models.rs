use serde::{Deserialize, Serialize};
use std::{collections::BTreeMap, path::PathBuf};

#[derive(Clone, Copy, Debug, Deserialize, Serialize, Eq, PartialEq, Ord, PartialOrd)]
#[serde(rename_all = "lowercase")]
pub enum Severity {
    Suggestion,
    Warning,
    Error,
}

impl Severity {
    pub fn parse(value: &str) -> Option<Self> {
        match value {
            "suggestion" => Some(Self::Suggestion),
            "warning" => Some(Self::Warning),
            "error" => Some(Self::Error),
            _ => None,
        }
    }
    pub fn as_str(self) -> &'static str {
        match self {
            Self::Suggestion => "suggestion",
            Self::Warning => "warning",
            Self::Error => "error",
        }
    }
}

#[derive(Clone, Debug, Deserialize)]
pub struct RawSniffer {
    pub kind: String,
    #[serde(flatten)]
    pub options: BTreeMap<String, serde_yaml_ng::Value>,
}

#[allow(dead_code)]
#[derive(Clone, Debug)]
pub struct Rule {
    pub id: String,
    pub code: String,
    pub name: String,
    pub family: String,
    pub applies_to: Vec<String>,
    pub severity: Severity,
    pub message: String,
    pub body: String,
    pub source: String,
    pub sniffers: Vec<RawSniffer>,
    pub fix: String,
    pub evidence: String,
    pub llm_exempt: bool,
}

impl Rule {
    pub fn sniffers(&self, kind: &str) -> impl Iterator<Item = &RawSniffer> {
        self.sniffers.iter().filter(move |s| s.kind == kind)
    }
}

#[derive(Clone, Debug, Deserialize)]
pub struct RawRule {
    pub id: String,
    pub code: String,
    pub name: String,
    pub family: String,
    pub applies_to: Vec<String>,
    pub severity: Severity,
    pub message: String,
    pub sniffers: Vec<RawSniffer>,
    #[serde(default = "manual")]
    pub fix: String,
    #[serde(default)]
    pub evidence: String,
    #[serde(default)]
    pub llm_exempt: bool,
}
fn manual() -> String {
    "manual".into()
}

#[derive(Clone, Debug, Deserialize, Serialize, Eq, PartialEq)]
pub struct Finding {
    pub path: String,
    pub line: usize,
    pub column: usize,
    pub end_line: usize,
    pub end_column: usize,
    pub rule: String,
    pub code: String,
    pub severity: Severity,
    pub detector: String,
    pub span: String,
    pub message: String,
}

impl Finding {
    pub fn key(&self) -> (&str, usize, usize, &str, &str) {
        (
            &self.path,
            self.line,
            self.column,
            &self.rule,
            &self.detector,
        )
    }
}

#[derive(Clone, Debug, Deserialize)]
pub struct ReportFinding {
    pub path: String,
    pub line: usize,
    pub column: usize,
    #[serde(default)]
    pub end_line: Option<usize>,
    #[serde(default)]
    pub end_column: Option<usize>,
    pub rule: String,
    pub code: String,
    pub severity: Severity,
    pub source: String,
    pub span: String,
    pub message: String,
    #[serde(default)]
    pub source_text: Option<String>,
}

impl ReportFinding {
    pub fn normalize(mut self) -> Self {
        self.end_line.get_or_insert(self.line);
        self.end_column
            .get_or_insert(self.column + self.span.chars().count());
        self
    }
}

#[derive(Clone, Debug)]
pub struct Context {
    pub data: toml::Value,
    pub project_root: PathBuf,
    pub rule_dirs: Vec<PathBuf>,
}
