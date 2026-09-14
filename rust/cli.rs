use crate::{
    adapters, config, discovery,
    error::{Result, message},
    models::{Finding, ReportFinding, Severity},
    report, rules,
};
use clap::{Parser, Subcommand, ValueEnum};
use std::{
    env, fs,
    io::{self, IsTerminal, Read},
    path::{Path, PathBuf},
};
#[derive(Parser)]
#[command(
    name = "sniff",
    version,
    about = "Find ambiguous, contradictory, and unverifiable writing.",
    arg_required_else_help = true
)]
struct Cli {
    #[command(subcommand)]
    command: Command,
}
#[derive(Subcommand)]
enum Command {
    #[command(about = "Run registered deterministic detectors.")]
    Check {
        #[arg(required = true, help = "Files, directories, or '-' for stdin.")]
        paths: Vec<String>,
        #[arg(long)]
        profile: Option<String>,
        #[arg(long)]
        config: Option<PathBuf>,
        #[arg(long = "format", value_enum, default_value = "human")]
        format: CheckFormat,
        #[arg(long,value_parser=["suggestion","warning","error"])]
        fail_on: Option<String>,
        #[arg(long)]
        fix: bool,
        #[arg(long, value_enum, default_value = "auto")]
        color: Color,
    },
    #[command(about = "Emit applicable LLM rule guidance.")]
    Rules {
        #[arg(long)]
        profile: Option<String>,
        #[arg(long)]
        target: Option<PathBuf>,
        #[arg(long)]
        config: Option<PathBuf>,
        #[arg(long = "format", value_enum, default_value = "llm")]
        format: RulesFormat,
    },
    #[command(about = "Render adjudicated JSONL findings.")]
    Report {
        #[arg(long, default_value = ".")]
        project_root: PathBuf,
        #[arg(long = "format", value_enum, default_value = "auto")]
        format: ReportFormat,
        #[arg(long, value_enum, default_value = "auto")]
        color: Color,
    },
}
#[derive(Clone, ValueEnum)]
enum CheckFormat {
    Human,
    Report,
    Json,
    Jsonl,
}
#[derive(Clone, ValueEnum)]
enum RulesFormat {
    Llm,
    Json,
    Jsonl,
}
#[derive(Clone, ValueEnum)]
enum ReportFormat {
    Auto,
    Terminal,
    Markdown,
}
#[derive(Clone, ValueEnum)]
enum Color {
    Auto,
    Always,
    Never,
}
fn colored(c: &Color) -> bool {
    match c {
        Color::Always => true,
        Color::Never => false,
        Color::Auto => {
            env::var_os("NO_COLOR").is_none()
                && env::var("TERM")
                    .map(|x| x != "dumb" && x != "unknown")
                    .unwrap_or(true)
                && io::stdout().is_terminal()
        }
    }
}
fn start(paths: &[String]) -> PathBuf {
    paths
        .iter()
        .find(|x| x.as_str() != "-")
        .map(PathBuf::from)
        .unwrap_or_else(|| env::current_dir().unwrap())
}
pub fn run() -> Result<()> {
    let cli = Cli::parse();
    let code = match cli.command {
        Command::Check {
            paths,
            profile,
            config,
            format,
            fail_on,
            fix,
            color,
        } => check(
            paths,
            profile,
            config,
            format,
            fail_on,
            fix,
            colored(&color),
        )?,
        Command::Rules {
            profile,
            target,
            config,
            format,
        } => emit_rules(profile, target, config, format)?,
        Command::Report {
            project_root,
            format,
            color,
        } => render(project_root, format, colored(&color))?,
    };
    if code != 0 {
        std::process::exit(code)
    }
    Ok(())
}
fn profile<'a>(
    data: &'a toml::Value,
    requested: Option<&'a str>,
) -> Result<(&'a str, &'a toml::map::Map<String, toml::Value>)> {
    let name = requested
        .or_else(|| data.get("default_profile").and_then(|x| x.as_str()))
        .unwrap_or("document");
    let p = data
        .get("profiles")
        .and_then(|x| x.get(name))
        .and_then(|x| x.as_table())
        .ok_or_else(|| message(format!("unknown profile {name:?}")))?;
    Ok((name, p))
}
fn check(
    paths: Vec<String>,
    requested: Option<String>,
    cfg: Option<PathBuf>,
    format: CheckFormat,
    fail: Option<String>,
    fix: bool,
    color: bool,
) -> Result<i32> {
    if paths.iter().filter(|x| x.as_str() == "-").count() > 1
        || paths.contains(&"-".into()) && paths.len() > 1
    {
        return Err(message("stdin ('-') cannot be combined with other inputs"));
    }
    if fix && paths.contains(&"-".into()) {
        return Err(message("--fix cannot modify stdin"));
    }
    let ctx = config::load_config(&start(&paths), cfg.as_deref())?;
    let (name, p) = profile(&ctx.data, requested.as_deref())?;
    let all = rules::load(&ctx)?;
    let selected = rules::selected(&all, &ctx.data, name)?;
    if selected.is_empty() {
        eprintln!("sniff: 0 rules selected");
        return Ok(0);
    }
    let mut actual = paths.clone();
    let mut stdin_file = None;
    let temp = tempfile::tempdir().map_err(|e| message(e.to_string()))?;
    if paths.contains(&"-".into()) {
        let mut text = String::new();
        io::stdin()
            .read_to_string(&mut text)
            .map_err(|e| message(e.to_string()))?;
        let path = temp.path().join(if name == "code" {
            "stdin.py"
        } else {
            "stdin.md"
        });
        fs::write(&path, &text).map_err(|e| message(e.to_string()))?;
        actual = vec![path.display().to_string()];
        stdin_file = Some((path, text));
    }
    let files = discovery::discover(&actual, p, &ctx.project_root)?;
    if files.is_empty() {
        eprintln!("sniff: 0 files selected");
        return Ok(0);
    }
    let before = adapters::run(&files, &selected, &ctx, name, false)?;
    let findings = if fix {
        adapters::run(&files, &selected, &ctx, name, true)?;
        let after = adapters::run(&files, &selected, &ctx, name, false)?;
        eprintln!(
            "sniff: applied {} safe fix(es); rechecked",
            before.len().saturating_sub(after.len())
        );
        after
    } else {
        before
    };
    let displayed: Vec<_> = findings
        .iter()
        .cloned()
        .map(|mut f| {
            if stdin_file
                .as_ref()
                .is_some_and(|(p, _)| Path::new(&f.path) == p)
            {
                f.path = "<stdin>".into()
            } else if let Ok(x) = Path::new(&f.path).strip_prefix(&ctx.project_root) {
                f.path = x.display().to_string()
            }
            f
        })
        .collect();
    output(
        &displayed,
        &format,
        &ctx.project_root,
        stdin_file.as_ref().map(|x| x.1.as_str()),
        color,
    )?;
    let threshold = Severity::parse(
        fail.as_deref()
            .or_else(|| ctx.data.get("fail_on").and_then(|x| x.as_str()))
            .unwrap_or("error"),
    )
    .unwrap();
    Ok(if findings.iter().any(|x| x.severity >= threshold) {
        1
    } else {
        0
    })
}
fn output(
    found: &[Finding],
    format: &CheckFormat,
    root: &Path,
    stdin: Option<&str>,
    color: bool,
) -> Result<()> {
    match format {
        CheckFormat::Json | CheckFormat::Jsonl => {
            for f in found {
                println!("{}", serde_json::to_string(f).unwrap())
            }
        }
        CheckFormat::Human => {
            for f in found {
                println!(
                    "{}:{}:{}  [{} {}]  {}  ({} candidate)\n  span:   {:?}\n  why:    {}",
                    f.path,
                    f.line,
                    f.column,
                    f.severity.as_str(),
                    f.code,
                    f.rule,
                    f.detector,
                    f.span,
                    f.message
                )
            }
        }
        CheckFormat::Report => {
            let values: Vec<_> = found
                .iter()
                .map(|f| ReportFinding {
                    path: f.path.clone(),
                    line: f.line,
                    column: f.column,
                    end_line: Some(f.end_line),
                    end_column: Some(f.end_column),
                    rule: f.rule.clone(),
                    code: f.code.clone(),
                    severity: f.severity,
                    source: format!("{} candidate", f.detector),
                    span: f.span.clone(),
                    message: f.message.clone(),
                    source_text: if f.path == "<stdin>" {
                        stdin.map(str::to_owned)
                    } else {
                        None
                    },
                })
                .collect();
            println!(
                "{}",
                report::render(&values, root, "candidate", false, color)
            );
        }
    }
    Ok(())
}
fn emit_rules(
    requested: Option<String>,
    target: Option<PathBuf>,
    cfg: Option<PathBuf>,
    format: RulesFormat,
) -> Result<i32> {
    let start = target.unwrap_or(env::current_dir().unwrap());
    let ctx = config::load_config(&start, cfg.as_deref())?;
    let (name, _) = profile(&ctx.data, requested.as_deref())?;
    let all = rules::load(&ctx)?;
    for rule in rules::selected(&all, &ctx.data, name)?
        .into_iter()
        .filter(|r| r.sniffers("llm").next().is_some())
    {
        let severity = rules::severity(rule, &ctx.data, name)?;
        match format {
            RulesFormat::Json | RulesFormat::Jsonl => println!(
                "{}",
                serde_json::json!({"id":rule.id,"code":rule.code,"severity":severity,"message":rule.message,"guidance":rule.body})
            ),
            RulesFormat::Llm => println!(
                "### {} {} [{}]\n{}\n\n{}\n",
                rule.code,
                rule.id,
                severity.as_str(),
                rule.message,
                rule.body
            ),
        }
    }
    Ok(0)
}
fn render(root: PathBuf, format: ReportFormat, color: bool) -> Result<i32> {
    let mut input = String::new();
    io::stdin()
        .read_to_string(&mut input)
        .map_err(|e| message(e.to_string()))?;
    let findings = report::parse(&input, true)?;
    let markdown = match format {
        ReportFormat::Markdown => true,
        ReportFormat::Terminal => false,
        ReportFormat::Auto => ["CLAUDECODE", "CLAUDE_CODE_ENTRYPOINT", "CODEX_THREAD_ID"]
            .iter()
            .any(|x| env::var_os(x).is_some()),
    };
    println!(
        "{}",
        report::render(
            &findings,
            &root.canonicalize().unwrap_or(root),
            "finding",
            markdown,
            color
        )
    );
    Ok(0)
}
