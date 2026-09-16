# LLM workflow

Running `sniff` directly produces deterministic candidates. An agent using the bundled skill
completes the contextual review with two additional commands:

```sh
sniff rules --target <path> --profile <profile>
sniff report --project-root <project-root>
```

`sniff rules` emits the complete selected semantic bundle. The agent evaluates every emitted
rule, confirms or rejects detector candidates, and can find violations that a detector missed.
A candidate is not a finding before this step.

Confirmed findings are passed as JSONL to `sniff report`. The report renderer owns presentation,
while the registry and layered configuration retain control of effective severity.

The [rule explorer](rules.md) shows the actual `sniff rules` output for every bundled profile.
