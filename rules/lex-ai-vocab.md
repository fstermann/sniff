---
id: lex-ai-vocab
code: LEX015
name: AI-vocab banned word
family: lexical
applies_to: [core]
severity: warning
fix: manual
evidence: RE
llm_exempt: true
message: Banned AI-vocab word. Use the plain word (leverage/utilize to use, facilitate to help).
sniffers:
  - kind: vale
    pattern: '\b(delve|delved|delving|delves|leverage|leverages|leveraged|leveraging|utilize|utilizes|utilized|utilizing|crucial|seamless|seamlessly|robust|robustly|underscore|underscores|underscored|underscoring|showcase|showcases|showcased|showcasing|foster|fosters|fostered|fostering|tapestry|pivotal|groundbreaking|vibrant|stunning|facilitate|facilitates|facilitated|facilitating|genuinely)\b'
    confidence: high
    hook_safe: true
    precision: 1.00   # outright ban: any occurrence is a violation
    n: 0
---

Words that mark text as AI-generated. Banned outright; any occurrence is a violation.
Reach for the plain word: leverage/utilize become "use", facilitate becomes "help", crucial becomes
"key" or drop it.

Bad:  We leverage caching to facilitate faster reads.
Good: Caching makes reads faster.

Not a finding inside a quoted example or code block.
