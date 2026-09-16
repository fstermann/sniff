# Find what is vague. Confirm what matters.

`sniff` combines deterministic detectors with LLM adjudication for documents, prompts,
specifications, comments, docstrings, and registered source-code rules.

[Install sniff](usage.md){ .md-button .md-button--primary }
[Explore rules](rules.md){ .md-button }

```sh
brew install fstermann/tap/sniff
sniff docs/ --profile document
```

## Detection is not judgment

1. **Detect.** Vale and Ruff emit candidates.
2. **Adjudicate.** An LLM evaluates every selected semantic rule, including rules that
   also have deterministic detectors.
3. **Report.** The renderer presents confirmed findings.

A deterministic match remains a candidate until the LLM confirms it. Configuration owns
severity, and `--fix` applies only detector-declared safe fixes.

## Choose a profile

| Profile | Checks |
|---|---|
| `document` | Standalone prose and markup |
| `prompt` | Prompts and agent instructions |
| `spec` | Requirements and specifications |
| `code` | Comments, docstrings, and registered source rules |
| `all` | Every registered rule and supported input type |

Project configuration can extend these profiles or define new ones.
