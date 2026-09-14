use assert_cmd::Command;
use predicates::prelude::*;
use std::fs;

#[test]
fn exposes_the_public_commands_and_version() {
    Command::cargo_bin("sniff")
        .unwrap()
        .arg("--help")
        .assert()
        .success()
        .stdout(predicate::str::contains("check"))
        .stdout(predicate::str::contains("rules"))
        .stdout(predicate::str::contains("report"));
    Command::cargo_bin("sniff")
        .unwrap()
        .arg("--version")
        .assert()
        .success()
        .stdout("sniff 0.1.0\n");
}

#[test]
fn bundled_registry_and_profile_are_available() {
    let output = Command::cargo_bin("sniff")
        .unwrap()
        .args(["rules", "--profile", "document", "--format", "jsonl"])
        .output()
        .unwrap();
    assert!(output.status.success());
    let lines: Vec<_> = String::from_utf8(output.stdout)
        .unwrap()
        .lines()
        .map(str::to_owned)
        .collect();
    assert_eq!(31, lines.len());
    assert!(
        lines
            .iter()
            .any(|line| line.contains("\"code\":\"LOG010\""))
    );
}

#[test]
fn report_rejects_candidates_and_renders_confirmed_findings() {
    let candidate = r#"{"path":"prompt.md","line":1,"column":1,"rule":"test-rule","code":"TST001","severity":"warning","source":"vale candidate","span":"text","message":"message"}"#;
    Command::cargo_bin("sniff")
        .unwrap()
        .args(["report", "--format", "terminal"])
        .write_stdin(candidate)
        .assert()
        .code(2)
        .stderr(predicate::str::contains("invalid source"));
    let confirmed = candidate.replace("vale candidate", "llm only");
    Command::cargo_bin("sniff")
        .unwrap()
        .args(["report", "--format", "terminal"])
        .write_stdin(confirmed)
        .assert()
        .success()
        .stdout(predicate::str::contains("[WARNING TST001] test-rule"))
        .stdout(predicate::str::contains("via LLM"));
}

#[test]
fn explicit_file_respects_profile_types() {
    let temp = tempfile::tempdir().unwrap();
    let source = temp.path().join("source.py");
    fs::write(&source, "# prose\n").unwrap();
    Command::cargo_bin("sniff")
        .unwrap()
        .args(["check", source.to_str().unwrap(), "--profile", "document"])
        .assert()
        .success()
        .stderr(predicate::str::contains("0 files selected"));
}

#[test]
fn invalid_input_uses_exit_two() {
    Command::cargo_bin("sniff")
        .unwrap()
        .args(["check", "definitely-missing.md"])
        .assert()
        .code(2)
        .stderr(predicate::str::contains("no such input"));
}
