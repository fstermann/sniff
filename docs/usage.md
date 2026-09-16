# Install and use

## Install

=== "Homebrew"

    ```sh
    brew install fstermann/tap/sniff
    ```

=== "Installer"

    ```sh
    curl --proto '=https' --tlsv1.2 -LsSf \
      https://github.com/fstermann/sniff/releases/latest/download/install.sh | sh
    ```

=== "Source"

    ```sh
    cargo install --path .
    ```

A source installation requires Vale separately. Release archives include a pinned Vale
runtime. Ruff is required only when a selected rule uses it.

## Check input

```sh
sniff docs/ --profile document
sniff requirements.md --profile spec --format report
sniff src/ --profile code --format jsonl
printf '%s\n' 'The system should respond quickly.' | sniff - --profile spec
```

The default input is the current directory. Explicit files are checked even when ignored;
directory discovery includes tracked and non-ignored untracked files.

## Output and status

Use `--format human|report|json|jsonl`. Exit status `0` means no finding met the failure
threshold, `1` means at least one did, and `2` indicates invalid input, invalid configuration,
or detector failure. The default failure threshold is `error`.

## Safe fixes

```sh
sniff docs/ --profile document --fix
```

`--fix` applies only detector-declared safe fixes, then checks the files again. It never
applies unsafe or LLM-authored edits and cannot modify stdin.
