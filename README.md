# sniff

`sniff` finds potential problems with linters, then checks whether they matter in
context. It works on documents, prompts, specifications, comments, docstrings, and
registered source-code rules.

This avoids two bad outcomes: treating every pattern match as a real problem, or asking
an LLM to review a project with no fixed rules. `sniff` uses both:

1. Vale and Ruff find candidates.
2. An LLM confirms or rejects those candidates and checks rules that need context.
3. `sniff` renders the confirmed findings.

The rule registry controls which checks run, their severity, and whether a fix is safe.
The LLM cannot change those decisions. A detector failure is an error instead of a
silent reduction in coverage.

A confirmed finding looks like this:

```text
 ___ _  _ ___ ___ ___
/ __| \| |_ _| __| __|
\__ \ .` || || _|| _|
|___/_|\_|___|_| |_|

1 finding across 1 file

prompt.md:2
　　[WARNING LOG010] log-universal-quantifier · via LLM

    │   1 │ Review the text.
    │ › 2 │ Must always apply.
    │     │ ^^^^^^^^^^^^^^^^^^

　　└── The scope is unbounded.
```

## Install

Homebrew is the recommended installation method on macOS or Linux:

```sh
brew install fstermann/tap/sniff
```

The command adds the `fstermann/tap` tap automatically. Upgrade later with
`brew upgrade sniff`. Homebrew installs and updates Vale as a declared dependency, so
it does not need to be installed separately.

On macOS or Linux, the installer downloads and verifies the release for your platform,
then installs `sniff` and its private Vale runtime under `~/.local/bin`:

```sh
curl --proto '=https' --tlsv1.2 -LsSf https://github.com/fstermann/sniff/releases/latest/download/install.sh | sh
```

There is no archive extraction or manual `chmod` step. Use `SNIFF_INSTALL_DIR` to
choose another binary directory, or pass `--version 0.1.0` when running a downloaded
copy of the installer.

Release archives are also available for manual and Windows installations. They contain
the `sniff` binary, a pinned Vale executable, both licenses, and a SHA-256 checksum.
Keep `sniff` and Vale in the archive's original layout and put `sniff` on `PATH`:

```sh
sniff .
```

To build and install from source:

```sh
cargo install --path .
```

A source installation needs [Vale](https://vale.sh/) installed separately. Select a
specific Vale binary with `--vale <path>` or `SNIFF_VALE`. Release builds find their
bundled Vale automatically.

Other adapters, currently Ruff, are needed only when a selected rule uses them. If a
required adapter is disabled or unavailable, the run fails.

## Use

Pass one or more files or directories to `sniff`:

```sh
sniff docs/ --profile document
sniff requirements.md --profile spec --format report
sniff src/ --profile code --format jsonl
```

The default input is the current directory. Pass `-` to read from stdin:

```sh
printf '%s\n' 'The system should respond quickly.' | sniff - --profile spec
```

Explicit files are checked even when ignored. Directory discovery checks tracked files
and untracked files that are not ignored.

### Profiles

| Profile | Checks |
|---|---|
| `document` | Standalone prose and markup |
| `prompt` | Prompts and agent instructions |
| `spec` | Requirements and specifications |
| `code` | Comments, docstrings, and registered source-code rules |
| `all` | Every registered rule and supported input type |

Projects can define more profiles in `sniff.toml`.

### Output and exit status

The check command supports human-readable output, rendered reports, JSON, and JSONL:

```sh
sniff . --format human
sniff . --format report
sniff . --format json
sniff . --format jsonl
```

Use `--color auto|always|never` to control terminal color. Automatic mode uses color
only when stdout is a terminal. `NO_COLOR` is also respected.

The exit status is:

| Status | Meaning |
|---:|---|
| `0` | No finding reached the configured failure threshold |
| `1` | At least one finding reached the threshold |
| `2` | Invalid input, invalid configuration, or detector failure |

The default threshold is `error`. Override it with `--fail-on` or in configuration.

Run `sniff --help` for the complete CLI. The older `sniff check` spelling remains
available as a deprecated alias.

### Fixes

`--fix` applies only fixes that a detector declares safe, then checks the files again:

```sh
sniff docs/ --profile document --fix
```

It does not apply unsafe refactors or edits written by an LLM. It cannot modify stdin.

## LLM workflow

Running `sniff` directly produces detector candidates. An agent using the bundled skill
completes the contextual review with two additional commands:

```sh
sniff rules --target <path> --profile <profile>
sniff report --project-root <project-root>
```

`sniff rules` emits the selected semantic rules. The agent evaluates every emitted LLM
rule, confirms or rejects detector candidates, and can find violations that a detector
missed. A candidate is not a confirmed finding until this step is complete.

`sniff report` reads confirmed JSONL findings from stdin and owns the final
presentation. It renders Markdown by default in Claude Code and Codex, and terminal
output elsewhere.

## Configure

Configuration is optional. `sniff` loads it in this order:

1. Bundled defaults in `config/defaults.toml`.
2. `$XDG_CONFIG_HOME/sniff/sniff.toml`, or `~/.config/sniff/sniff.toml`.
3. The nearest `sniff.toml`, searching from the target toward the Git root.
4. Command-line flags.

Mappings merge recursively, lists extend without duplicates, and later scalar values
replace earlier values. Outside a Git repository, discovery searches upward and uses
the nearest configuration file. Pass `--config <path>` to choose one explicitly.

```toml
version = 1
default_profile = "document"
fail_on = "warning"

# Extend a bundled profile.
[profiles.document]
exclude = ["vendor/**", "generated/**"]
exclude_rules = ["lex-politeness-padding"]

# Define a project profile. Include `core` when its rules are wanted.
[profiles.release-notes]
tags = ["core", "document", "release-notes"]
include = ["CHANGELOG.md", "docs/releases/**/*.md"]
exclude = []
include_rules = []
exclude_rules = []

# Change rule policy without redefining the detector.
[rules.lex-subjective]
enabled = false

[rules.lex-open-ended]
severity = "error"

[adapters.vale]
enabled = true
executable = "vale"

[adapters.ruff]
enabled = true
executable = "ruff"
```

Valid severities are `suggestion`, `warning`, and `error`. Configuration owns the
effective severity; an LLM does not change it.

## Add rules

Put personal rules in `$XDG_CONFIG_HOME/sniff/rules/` or
`~/.config/sniff/rules/`. Put project rules in `.sniff/rules/`.

Custom rules extend the registry; they cannot replace an existing rule. Each rule ID
and code must be unique across the bundled, personal, and project layers.

A rule is a Markdown file with YAML frontmatter followed by the guidance used during
contextual review:

```markdown
---
id: lex-loophole
code: LEX005
name: Loophole or escape clause
family: lexical
applies_to: [core, spec]
severity: warning
fix: manual
evidence: ISO
message: Optional-clause phrase makes the requirement skippable.
sniffers:
  - kind: vale
    pattern: '\b(if possible|where applicable)\b'
    confidence: high
    hook_safe: false
  - kind: llm
    confidence: medium
    hook_safe: false
---

What the problem is and why it matters.

Bad: An example violation.
Good: A corrected example.

Not a finding when: the contextual exclusions.
```

The filename must be `<id>.md`. IDs use lowercase hyphenated names. Codes use three
uppercase family letters and three digits, such as `LEX005`. Assign the next unused
number and never renumber an existing rule.

Vale sniffers require `pattern`. Ruff sniffers require the native Ruff `rule` code.
Every deterministic rule also needs an LLM sniffer unless it sets `llm_exempt: true`.

`hook_safe` means a deterministic detector reached at least 0.90 precision over at
least 25 hand-labelled candidates. It does not change severity or skip LLM evaluation.
Record certification evidence in [eval/MEASUREMENTS.md](eval/MEASUREMENTS.md).

## Develop

Install the local commit gate:

```sh
pre-commit install
```

Run the test suite and quality gates:

```sh
cargo test
pre-commit run --all-files
```

It checks repository hygiene, Rust formatting, and Clippy. GitHub Actions runs the same
configuration and tests on Linux, macOS, and Windows.

Further project documentation:

- Maintainer guidance: [AGENTS.md](AGENTS.md)
- Detector certification evidence: [eval/MEASUREMENTS.md](eval/MEASUREMENTS.md)
- Downstream-effect experiment: [eval/EVAL.md](eval/EVAL.md)
