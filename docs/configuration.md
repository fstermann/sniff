# Configuration

Configuration is optional. `sniff` loads bundled defaults, user configuration, the nearest
project `sniff.toml`, then command-line flags. Mappings merge recursively, lists extend without
duplicates, and later scalar values replace earlier values.

```toml
version = 1
default_profile = "document"
fail_on = "warning"

[profiles.document]
exclude = ["vendor/**", "generated/**"]
exclude_rules = ["lex-politeness-padding"]

[rules.lex-subjective]
enabled = false

[rules.lex-open-ended]
severity = "error"
```

Valid severities are `suggestion`, `warning`, and `error`. Put personal rules in
`$XDG_CONFIG_HOME/sniff/rules/` (normally `~/.config/sniff/rules/`) and project rules in
`.sniff/rules/`. Custom rules extend the registry and cannot replace an existing ID or code.

See the repository [README](https://github.com/fstermann/sniff#configure) for the complete
configuration and custom rule schema.
