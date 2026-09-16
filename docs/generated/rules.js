window.SNIFF_DOCS = {
  "profiles": {
    "registry": {
      "rules": [
        "lex-ai-vocab",
        "lex-ambiguous-adverb",
        "lex-comparative",
        "lex-connotation",
        "lex-em-dash",
        "lex-hedge-stack",
        "lex-loophole",
        "lex-open-ended",
        "lex-overloaded-term",
        "lex-politeness-padding",
        "lex-subjective",
        "lex-superlative",
        "lex-term-drift",
        "lex-undefined-jargon",
        "lex-vague-quantifier",
        "log-constraint-overload",
        "log-contradiction",
        "log-duplicate-directive",
        "log-false-presupposition",
        "log-leading-frame",
        "log-negation-only",
        "log-no-priority",
        "log-no-success-criteria",
        "log-stale-directive",
        "log-universal-quantifier",
        "log-unspecified-output",
        "prag-curse-of-knowledge",
        "prag-persona-conflict",
        "prag-register-mismatch",
        "prag-unstated-audience",
        "ref-attachment",
        "ref-incomplete",
        "ref-missing-actor",
        "ref-passive-actor",
        "ref-scope-ambiguity",
        "ref-vague-pronoun",
        "str-buried-instruction",
        "str-example-contradicts-rule",
        "str-example-label-imbalance",
        "str-example-recency",
        "str-format-leakage",
        "str-inconsistent-delimiters",
        "str-instruction-data-mixing",
        "str-irrelevant-context",
        "str-premise-order"
      ],
      "prompt": null
    },
    "document": {
      "rules": [
        "lex-ambiguous-adverb",
        "lex-comparative",
        "lex-connotation",
        "lex-hedge-stack",
        "lex-loophole",
        "lex-open-ended",
        "lex-overloaded-term",
        "lex-politeness-padding",
        "lex-subjective",
        "lex-superlative",
        "lex-term-drift",
        "lex-undefined-jargon",
        "lex-vague-quantifier",
        "log-contradiction",
        "log-duplicate-directive",
        "log-negation-only",
        "log-no-priority",
        "log-no-success-criteria",
        "log-stale-directive",
        "log-universal-quantifier",
        "log-unspecified-output",
        "prag-curse-of-knowledge",
        "prag-persona-conflict",
        "prag-register-mismatch",
        "prag-unstated-audience",
        "ref-attachment",
        "ref-incomplete",
        "ref-missing-actor",
        "ref-passive-actor",
        "ref-scope-ambiguity",
        "ref-vague-pronoun"
      ],
      "prompt": "### LEX001 lex-ambiguous-adverb [warning]\nManner adverb with no measurable criterion.\n\nAn adverb that names a quality of execution without a threshold. \"Handle errors gracefully\" gives\nthe implementer nothing to check against.\n\nBad:  Handle a dropped connection gracefully.\nGood: On a dropped connection, retry twice with backoff, then surface a `ConnectionError`.\n\nNot a finding inside a quoted example or code block.\n\n### LEX002 lex-comparative [warning]\nComparative with no stated reference point.\n\nA comparative names a direction but no baseline, so nothing says how much or than what. The pattern is a trigger; the model checks whether a reference point is given.\n\nBad:  Make the parser faster.\nGood: Make the parser run in under 100 ms.\n\nNot a finding when a baseline follows (\"faster than the current 200 ms\") or inside a quoted example.\n\n### LEX003 lex-connotation [warning]\nA word importing a register the task never asked for.\n\nA word drags in tone the task did not ask for, nudging the output's register.\n\nBad:  Interrogate the config and brutally trim the output.\nGood: Read the config and remove unused output.\n\nNot a finding when the loaded word is the accurate one.\n\n### LEX004 lex-hedge-stack [warning]\nStacked hedges signal optionality you probably did not intend.\n\nTwo or more hedges in a row (\"could potentially possibly\") weaken an instruction to the point the\nreader treats it as optional. Collapse to one modal or none.\n\nBad:  You could possibly want to validate the token.\nGood: Validate the token.\n\nNot a finding inside a quoted example or code block.\n\n### LEX005 lex-loophole [warning]\nOptional-clause phrase makes the requirement skippable without saying who decides.\n\nPhrases that make a requirement optional without saying who decides or on what condition. The\nreader is licensed to skip the work, and the author keeps deniability that it was ever required.\n\nBad:  Validate the payload where applicable.\nGood: Validate the payload when it contains a `customer_id`.\n\nNot a finding when the deciding condition is stated in the same sentence (e.g. \"if the file\nexists, delete it\"), or when the phrase appears inside a quoted example or code block.\n\n### LEX006 lex-open-ended [warning]\nOpen-ended list leaves the tail of the enumeration undefined.\n\n\"etc.\" in a spec hands the reader the job of completing the list, and two readers complete it\ndifferently.\n\nBad:  Sanitize the input: strip tags, escape quotes, etc.\nGood: Sanitize the input: strip tags, escape quotes, and reject bytes above 0x7F.\n\nNot a finding inside a quoted example or code block.\n\n### LEX007 lex-overloaded-term [warning]\nOne term standing for two distinct concepts.\n\nOne word carrying two meanings in the same document. The reader cannot tell which is meant.\n\nBad:  Load the context from disk, then append the conversation to the context.\nGood: Load the config from disk, then append the message to the history.\n\nNot a finding when both uses share a single meaning.\n\n### LEX008 lex-politeness-padding [suggestion]\nFiller politeness adds tokens and no constraint.\n\nSofteners aimed at a model carry no instruction and cost tokens. Drop them; state the task.\n\nBad:  I was wondering if you could please validate the token.\nGood: Validate the token.\n\nNot a finding inside a quoted example or code block.\n\n### LEX009 lex-subjective [warning]\nSubjective adjective with no shared referent; not verifiable.\n\nAdjectives that assert quality without a testable referent. Two readers disagree on whether the\noutput met the bar.\n\nBad:  Build a user-friendly, robust config loader.\nGood: The loader rejects an unknown key with a named error and loads a 1 MB file in under 50 ms.\n\nNot a finding inside a quoted example or code block.\n\n### LEX010 lex-superlative [warning]\nSuperlative sets an unbounded, unreachable target.\n\nA superlative names a target with no ceiling, so nothing counts as done. \"The\" + best is excluded\nbecause \"best practice\" is idiom; the model pass judges bare \"best\".\n\nBad:  Choose the optimal data structure for the fastest lookup.\nGood: Use a structure with O(1) average lookup; a hash map is fine.\n\nNot a finding inside a quoted example or code block.\n\n### LEX011 lex-term-drift [warning]\nSeveral terms used for one concept; the reader infers a distinction that isn't there.\n\nSeveral words for one concept. The reader applies the principle of contrast and assumes a difference that was never meant.\n\nBad:  Send the user's token, fetch the customer record, update the requester profile.\nGood: Send the user's token, fetch the user's record, update the user's profile.\n\nNot a finding when the terms denote genuinely different roles.\n\n### LEX012 lex-undefined-jargon [warning]\nA domain term or acronym used before it is expanded.\n\nAn acronym or domain term used with no first-use expansion. A reader outside the domain is stuck.\n\nBad:  Set the MTU before the NIC initialises.\nGood: Set the maximum transmission unit (MTU) before the network card initialises.\n\nNot a finding when the term is expanded on first use or is universally known.\n\n### LEX013 lex-vague-quantifier [warning]\nNon-verifiable quantity; give a number or a bound.\n\nA quantity word with no number behind it. \"Sufficient logging\" cannot be checked. Bare \"some\",\n\"several\" and \"many\" are deliberately excluded here because they false-positive too often; the\nmodel pass catches them in context.\n\nBad:  Add sufficient retries and a variety of test cases.\nGood: Add three retries and test the empty, single-item and 10k-item inputs.\n\nNot a finding inside a quoted example or code block.\n\n### LOG002 log-contradiction [warning]\nTwo constraints in one instruction that cannot both hold.\n\nTwo constraints in the same instruction that cannot both hold (\"detailed but concise\", \"casual but\nformal\", \"exhaustive list, keep it short\"). Models rarely flag the conflict or ask which to\nprioritise; they silently blend the two and satisfy neither.\n\nNo reliable surface signal, so this is model-only. \"but\", \"however\" and \"yet\" often join the two\nhalves, but most uses of those words are not contradictions, so they are not a usable trigger.\n\nBad:  Write a detailed but concise summary covering every edge case in two sentences.\nGood: Write a summary of at most three sentences; name the two highest-impact edge cases.\n\nNot a finding when the two constraints apply to different scopes (e.g. \"verbose logs, terse UI\ncopy\"), or when one clause resolves the other (a stated tie-breaker).\n\n### LOG003 log-duplicate-directive [warning]\nThe same rule stated twice; the copies drift on edit.\n\nOne rule said twice in different words. It costs tokens and the two copies drift apart when one is edited.\n\nBad:  Keep it short. Later in the doc: Be concise and don't pad the answer.\nGood: Keep the answer under three sentences.\n\nNot a finding when the two statements cover different scopes.\n\n### LOG006 log-negation-only [warning]\nA prohibition that names no goal and keeps the banned content in context.\n\nA negative instruction names what not to do but not what to do, and the prohibited content stays in context. Larger models do worse on negated prompts. The model checks for a positive target.\n\nBad:  Don't be verbose.\nGood: Keep replies to three sentences.\n\nNot a finding when a positive instruction accompanies the prohibition.\n\n### LOG007 log-no-priority [warning]\nTwo constraints that can conflict at runtime with no tie-breaker.\n\nTwo constraints that will sometimes collide, with nothing saying which wins.\n\nBad:  Be thorough and finish within one paragraph.\nGood: Finish within one paragraph; drop detail before length.\n\nNot a finding when the constraints cannot conflict.\n\n### LOG008 log-no-success-criteria [warning]\nA task with no statement of what a correct output looks like.\n\nA task with no definition of done. Any output is arguably compliant.\n\nBad:  Improve the onboarding docs.\nGood: Rewrite the onboarding docs so a new hire can deploy in under 30 minutes.\n\nNot a finding when success is defined elsewhere in scope.\n\n### LOG009 log-stale-directive [warning]\nReferences a tool, file or step that no longer exists.\n\nAn instruction pointing at something removed. Detecting it needs an inventory of current tools and files.\n\nBad:  Run `make lint` before committing, after `make lint` was deleted.\nGood: Run `npm run lint` before committing.\n\nNot a finding when the referenced item still exists.\n\n### LOG010 log-universal-quantifier [warning]\nalways/never attached to something that cannot be guaranteed. In the spec pack this is an error.\n\nA universal claim bound to something the reader cannot actually guarantee. The model checks enforceability.\n\nBad:  Always return within 10 ms.\nGood: Return within 10 ms for inputs under 1 KB.\n\nNot a finding when the universal is genuinely enforceable or bounded.\n\n### LOG011 log-unspecified-output [warning]\nNo format, schema or length contract where a consumer expects one.\n\nNo format, schema, or length given where downstream code will parse the output.\n\nBad:  Return the parsed users.\nGood: Return a JSON array of {id, email} objects.\n\nNot a finding when no consumer needs a fixed shape.\n\n### PRG001 prag-curse-of-knowledge [warning]\nThe author's unstated background is load-bearing for the task.\n\nThe task leans on background only the author holds. The reader cannot act on it.\n\nBad:  Fix it the way we discussed.\nGood: Fix the retry logic to back off exponentially.\n\nNot a finding when the shared context is written down.\n\n### PRG002 prag-persona-conflict [warning]\nAn assigned persona that conflicts with the task.\n\nThe assigned persona pulls against what the task needs.\n\nBad:  You are terse. Now write a full tutorial with worked examples.\nGood: Write a full tutorial with worked examples.\n\nNot a finding when persona and task agree.\n\n### PRG003 prag-register-mismatch [warning]\nAn instruction register implying an output register nobody asked for.\n\nThe instruction's tone implies an output tone the author did not request.\n\nBad:  Casually, produce the formal compliance report.\nGood: Produce the formal compliance report.\n\nNot a finding when the register matches the output.\n\n### PRG004 prag-unstated-audience [warning]\nOutput quality depends on a reader profile the prompt never gives.\n\nThe right output depends on who reads it, and the prompt never says.\n\nBad:  Explain how TLS works.\nGood: Explain how TLS works to a backend engineer new to cryptography.\n\nNot a finding when the audience is stated or does not matter.\n\n### REF001 ref-attachment [warning]\nA modifier attachable to two heads.\n\nA prepositional or relative clause that can attach to two heads, including garden-path readings.\n\nBad:  Log the request from the client that failed.\nGood: Log the request that failed; it came from the client.\n\nNot a finding when only one attachment is grammatically possible.\n\n### REF002 ref-incomplete [warning]\nA reference with no resolvable target.\n\nA pointer to something the reader cannot resolve. The pattern triggers; the model checks whether the target is actually findable.\n\nBad:  Follow the steps in the section above.\nGood: Follow the steps in section 3.2 of this file.\n\nNot a finding when the target is numbered or named unambiguously.\n\n### REF003 ref-missing-actor [warning]\nAn instruction with no stated agent or trigger. In the spec pack this is an error.\n\nA requirement with no agent, no condition, or neither. EARS templates exist to force both.\n\nBad:  The cache is cleared on startup.\nGood: The boot script clears the cache on startup.\n\nNot a finding when the actor and trigger are unambiguous in the surrounding section.\n\n### REF004 ref-passive-actor [warning]\nPassive voice that drops the actor.\n\nPassive that omits who acts. Passive alone is fine; passive with no agent leaves the doer unspecified. The model confirms the actor is missing.\n\nBad:  The output should be validated.\nGood: The CI job validates the output.\n\nNot a finding when the actor is named (\"validated by the gateway\") or obvious in context.\n\n### REF005 ref-scope-ambiguity [warning]\nModifier attachment across and/or is undecidable.\n\nA chain of and/or where a modifier could bind to one term or all of them. The model checks whether the grouping is actually ambiguous.\n\nBad:  Delete files that are old and unused or temporary.\nGood: Delete files older than 30 days.\n\nNot a finding when parentheses or wording fix the grouping.\n\n### REF006 ref-vague-pronoun [warning]\nSentence-initial pronoun with an ambiguous or distant antecedent.\n\nA sentence-initial bare demonstrative used as a pronoun (\"This is...\", \"It should...\") whose\nantecedent is ambiguous or distant. The reader, and a model, must guess which of several prior\nnouns the pronoun points at.\n\nThe pattern is a trigger only: it finds sentence-initial `This/That/It/These/Those` followed by a\nverb, which marks pronoun use rather than a determiner (\"This value\" does not fire). The model then\nadjudicates whether the antecedent is actually ambiguous.\n\nBad:  The parser reads the config and the loader reads the manifest. This is then cached.\nGood: The parser reads the config and the loader reads the manifest. The parsed config is cached.\n\nNot a finding when exactly one antecedent is in scope, when the demonstrator is a determiner (\"This\nfunction returns...\"), or inside a quoted example or code block.\n\n"
    },
    "prompt": {
      "rules": [
        "lex-ambiguous-adverb",
        "lex-comparative",
        "lex-connotation",
        "lex-hedge-stack",
        "lex-loophole",
        "lex-open-ended",
        "lex-overloaded-term",
        "lex-politeness-padding",
        "lex-subjective",
        "lex-superlative",
        "lex-term-drift",
        "lex-undefined-jargon",
        "lex-vague-quantifier",
        "log-constraint-overload",
        "log-contradiction",
        "log-duplicate-directive",
        "log-false-presupposition",
        "log-leading-frame",
        "log-negation-only",
        "log-no-priority",
        "log-no-success-criteria",
        "log-stale-directive",
        "log-universal-quantifier",
        "log-unspecified-output",
        "prag-curse-of-knowledge",
        "prag-persona-conflict",
        "prag-register-mismatch",
        "prag-unstated-audience",
        "ref-attachment",
        "ref-incomplete",
        "ref-missing-actor",
        "ref-passive-actor",
        "ref-scope-ambiguity",
        "ref-vague-pronoun",
        "str-buried-instruction",
        "str-example-contradicts-rule",
        "str-example-label-imbalance",
        "str-example-recency",
        "str-format-leakage",
        "str-inconsistent-delimiters",
        "str-instruction-data-mixing",
        "str-irrelevant-context",
        "str-premise-order"
      ],
      "prompt": "### LEX001 lex-ambiguous-adverb [warning]\nManner adverb with no measurable criterion.\n\nAn adverb that names a quality of execution without a threshold. \"Handle errors gracefully\" gives\nthe implementer nothing to check against.\n\nBad:  Handle a dropped connection gracefully.\nGood: On a dropped connection, retry twice with backoff, then surface a `ConnectionError`.\n\nNot a finding inside a quoted example or code block.\n\n### LEX002 lex-comparative [warning]\nComparative with no stated reference point.\n\nA comparative names a direction but no baseline, so nothing says how much or than what. The pattern is a trigger; the model checks whether a reference point is given.\n\nBad:  Make the parser faster.\nGood: Make the parser run in under 100 ms.\n\nNot a finding when a baseline follows (\"faster than the current 200 ms\") or inside a quoted example.\n\n### LEX003 lex-connotation [warning]\nA word importing a register the task never asked for.\n\nA word drags in tone the task did not ask for, nudging the output's register.\n\nBad:  Interrogate the config and brutally trim the output.\nGood: Read the config and remove unused output.\n\nNot a finding when the loaded word is the accurate one.\n\n### LEX004 lex-hedge-stack [warning]\nStacked hedges signal optionality you probably did not intend.\n\nTwo or more hedges in a row (\"could potentially possibly\") weaken an instruction to the point the\nreader treats it as optional. Collapse to one modal or none.\n\nBad:  You could possibly want to validate the token.\nGood: Validate the token.\n\nNot a finding inside a quoted example or code block.\n\n### LEX005 lex-loophole [warning]\nOptional-clause phrase makes the requirement skippable without saying who decides.\n\nPhrases that make a requirement optional without saying who decides or on what condition. The\nreader is licensed to skip the work, and the author keeps deniability that it was ever required.\n\nBad:  Validate the payload where applicable.\nGood: Validate the payload when it contains a `customer_id`.\n\nNot a finding when the deciding condition is stated in the same sentence (e.g. \"if the file\nexists, delete it\"), or when the phrase appears inside a quoted example or code block.\n\n### LEX006 lex-open-ended [warning]\nOpen-ended list leaves the tail of the enumeration undefined.\n\n\"etc.\" in a spec hands the reader the job of completing the list, and two readers complete it\ndifferently.\n\nBad:  Sanitize the input: strip tags, escape quotes, etc.\nGood: Sanitize the input: strip tags, escape quotes, and reject bytes above 0x7F.\n\nNot a finding inside a quoted example or code block.\n\n### LEX007 lex-overloaded-term [warning]\nOne term standing for two distinct concepts.\n\nOne word carrying two meanings in the same document. The reader cannot tell which is meant.\n\nBad:  Load the context from disk, then append the conversation to the context.\nGood: Load the config from disk, then append the message to the history.\n\nNot a finding when both uses share a single meaning.\n\n### LEX008 lex-politeness-padding [suggestion]\nFiller politeness adds tokens and no constraint.\n\nSofteners aimed at a model carry no instruction and cost tokens. Drop them; state the task.\n\nBad:  I was wondering if you could please validate the token.\nGood: Validate the token.\n\nNot a finding inside a quoted example or code block.\n\n### LEX009 lex-subjective [warning]\nSubjective adjective with no shared referent; not verifiable.\n\nAdjectives that assert quality without a testable referent. Two readers disagree on whether the\noutput met the bar.\n\nBad:  Build a user-friendly, robust config loader.\nGood: The loader rejects an unknown key with a named error and loads a 1 MB file in under 50 ms.\n\nNot a finding inside a quoted example or code block.\n\n### LEX010 lex-superlative [warning]\nSuperlative sets an unbounded, unreachable target.\n\nA superlative names a target with no ceiling, so nothing counts as done. \"The\" + best is excluded\nbecause \"best practice\" is idiom; the model pass judges bare \"best\".\n\nBad:  Choose the optimal data structure for the fastest lookup.\nGood: Use a structure with O(1) average lookup; a hash map is fine.\n\nNot a finding inside a quoted example or code block.\n\n### LEX011 lex-term-drift [warning]\nSeveral terms used for one concept; the reader infers a distinction that isn't there.\n\nSeveral words for one concept. The reader applies the principle of contrast and assumes a difference that was never meant.\n\nBad:  Send the user's token, fetch the customer record, update the requester profile.\nGood: Send the user's token, fetch the user's record, update the user's profile.\n\nNot a finding when the terms denote genuinely different roles.\n\n### LEX012 lex-undefined-jargon [warning]\nA domain term or acronym used before it is expanded.\n\nAn acronym or domain term used with no first-use expansion. A reader outside the domain is stuck.\n\nBad:  Set the MTU before the NIC initialises.\nGood: Set the maximum transmission unit (MTU) before the network card initialises.\n\nNot a finding when the term is expanded on first use or is universally known.\n\n### LEX013 lex-vague-quantifier [warning]\nNon-verifiable quantity; give a number or a bound.\n\nA quantity word with no number behind it. \"Sufficient logging\" cannot be checked. Bare \"some\",\n\"several\" and \"many\" are deliberately excluded here because they false-positive too often; the\nmodel pass catches them in context.\n\nBad:  Add sufficient retries and a variety of test cases.\nGood: Add three retries and test the empty, single-item and 10k-item inputs.\n\nNot a finding inside a quoted example or code block.\n\n### LOG001 log-constraint-overload [warning]\nSo many simultaneous constraints that the all-satisfied rate collapses.\n\nPer-constraint accuracy holds while the all-constraints-satisfied rate falls as the count rises. Count the independent constraints in one instruction.\n\nBad:  Reply in JSON, under 50 words, in French, no numerals, cite two sources, and rhyme.\nGood: Reply in JSON with a summary field under 50 words.\n\nNot a finding when the constraints are few or independent.\n\n### LOG002 log-contradiction [warning]\nTwo constraints in one instruction that cannot both hold.\n\nTwo constraints in the same instruction that cannot both hold (\"detailed but concise\", \"casual but\nformal\", \"exhaustive list, keep it short\"). Models rarely flag the conflict or ask which to\nprioritise; they silently blend the two and satisfy neither.\n\nNo reliable surface signal, so this is model-only. \"but\", \"however\" and \"yet\" often join the two\nhalves, but most uses of those words are not contradictions, so they are not a usable trigger.\n\nBad:  Write a detailed but concise summary covering every edge case in two sentences.\nGood: Write a summary of at most three sentences; name the two highest-impact edge cases.\n\nNot a finding when the two constraints apply to different scopes (e.g. \"verbose logs, terse UI\ncopy\"), or when one clause resolves the other (a stated tie-breaker).\n\n### LOG003 log-duplicate-directive [warning]\nThe same rule stated twice; the copies drift on edit.\n\nOne rule said twice in different words. It costs tokens and the two copies drift apart when one is edited.\n\nBad:  Keep it short. Later in the doc: Be concise and don't pad the answer.\nGood: Keep the answer under three sentences.\n\nNot a finding when the two statements cover different scopes.\n\n### LOG004 log-false-presupposition [warning]\nThe instruction presupposes a fact not established; invites confabulation.\n\nThe instruction takes an unestablished fact as given, so the model confabulates a reason rather than checking.\n\nBad:  Explain why the cache lookup fails.\nGood: Check whether the cache lookup fails; if it does, explain why.\n\nNot a finding when the presupposed fact is established earlier.\n\n### LOG005 log-leading-frame [warning]\nFraming that pushes agreement over assessment.\n\nWording that asks the reader to agree rather than assess. The model checks whether the frame presumes the answer.\n\nBad:  Confirm that this design is correct.\nGood: Assess whether this design is correct.\n\nNot a finding when the framing is neutral.\n\n### LOG006 log-negation-only [warning]\nA prohibition that names no goal and keeps the banned content in context.\n\nA negative instruction names what not to do but not what to do, and the prohibited content stays in context. Larger models do worse on negated prompts. The model checks for a positive target.\n\nBad:  Don't be verbose.\nGood: Keep replies to three sentences.\n\nNot a finding when a positive instruction accompanies the prohibition.\n\n### LOG007 log-no-priority [warning]\nTwo constraints that can conflict at runtime with no tie-breaker.\n\nTwo constraints that will sometimes collide, with nothing saying which wins.\n\nBad:  Be thorough and finish within one paragraph.\nGood: Finish within one paragraph; drop detail before length.\n\nNot a finding when the constraints cannot conflict.\n\n### LOG008 log-no-success-criteria [warning]\nA task with no statement of what a correct output looks like.\n\nA task with no definition of done. Any output is arguably compliant.\n\nBad:  Improve the onboarding docs.\nGood: Rewrite the onboarding docs so a new hire can deploy in under 30 minutes.\n\nNot a finding when success is defined elsewhere in scope.\n\n### LOG009 log-stale-directive [warning]\nReferences a tool, file or step that no longer exists.\n\nAn instruction pointing at something removed. Detecting it needs an inventory of current tools and files.\n\nBad:  Run `make lint` before committing, after `make lint` was deleted.\nGood: Run `npm run lint` before committing.\n\nNot a finding when the referenced item still exists.\n\n### LOG010 log-universal-quantifier [warning]\nalways/never attached to something that cannot be guaranteed. In the spec pack this is an error.\n\nA universal claim bound to something the reader cannot actually guarantee. The model checks enforceability.\n\nBad:  Always return within 10 ms.\nGood: Return within 10 ms for inputs under 1 KB.\n\nNot a finding when the universal is genuinely enforceable or bounded.\n\n### LOG011 log-unspecified-output [warning]\nNo format, schema or length contract where a consumer expects one.\n\nNo format, schema, or length given where downstream code will parse the output.\n\nBad:  Return the parsed users.\nGood: Return a JSON array of {id, email} objects.\n\nNot a finding when no consumer needs a fixed shape.\n\n### PRG001 prag-curse-of-knowledge [warning]\nThe author's unstated background is load-bearing for the task.\n\nThe task leans on background only the author holds. The reader cannot act on it.\n\nBad:  Fix it the way we discussed.\nGood: Fix the retry logic to back off exponentially.\n\nNot a finding when the shared context is written down.\n\n### PRG002 prag-persona-conflict [warning]\nAn assigned persona that conflicts with the task.\n\nThe assigned persona pulls against what the task needs.\n\nBad:  You are terse. Now write a full tutorial with worked examples.\nGood: Write a full tutorial with worked examples.\n\nNot a finding when persona and task agree.\n\n### PRG003 prag-register-mismatch [warning]\nAn instruction register implying an output register nobody asked for.\n\nThe instruction's tone implies an output tone the author did not request.\n\nBad:  Casually, produce the formal compliance report.\nGood: Produce the formal compliance report.\n\nNot a finding when the register matches the output.\n\n### PRG004 prag-unstated-audience [warning]\nOutput quality depends on a reader profile the prompt never gives.\n\nThe right output depends on who reads it, and the prompt never says.\n\nBad:  Explain how TLS works.\nGood: Explain how TLS works to a backend engineer new to cryptography.\n\nNot a finding when the audience is stated or does not matter.\n\n### REF001 ref-attachment [warning]\nA modifier attachable to two heads.\n\nA prepositional or relative clause that can attach to two heads, including garden-path readings.\n\nBad:  Log the request from the client that failed.\nGood: Log the request that failed; it came from the client.\n\nNot a finding when only one attachment is grammatically possible.\n\n### REF002 ref-incomplete [warning]\nA reference with no resolvable target.\n\nA pointer to something the reader cannot resolve. The pattern triggers; the model checks whether the target is actually findable.\n\nBad:  Follow the steps in the section above.\nGood: Follow the steps in section 3.2 of this file.\n\nNot a finding when the target is numbered or named unambiguously.\n\n### REF003 ref-missing-actor [warning]\nAn instruction with no stated agent or trigger. In the spec pack this is an error.\n\nA requirement with no agent, no condition, or neither. EARS templates exist to force both.\n\nBad:  The cache is cleared on startup.\nGood: The boot script clears the cache on startup.\n\nNot a finding when the actor and trigger are unambiguous in the surrounding section.\n\n### REF004 ref-passive-actor [warning]\nPassive voice that drops the actor.\n\nPassive that omits who acts. Passive alone is fine; passive with no agent leaves the doer unspecified. The model confirms the actor is missing.\n\nBad:  The output should be validated.\nGood: The CI job validates the output.\n\nNot a finding when the actor is named (\"validated by the gateway\") or obvious in context.\n\n### REF005 ref-scope-ambiguity [warning]\nModifier attachment across and/or is undecidable.\n\nA chain of and/or where a modifier could bind to one term or all of them. The model checks whether the grouping is actually ambiguous.\n\nBad:  Delete files that are old and unused or temporary.\nGood: Delete files older than 30 days.\n\nNot a finding when parentheses or wording fix the grouping.\n\n### REF006 ref-vague-pronoun [warning]\nSentence-initial pronoun with an ambiguous or distant antecedent.\n\nA sentence-initial bare demonstrative used as a pronoun (\"This is...\", \"It should...\") whose\nantecedent is ambiguous or distant. The reader, and a model, must guess which of several prior\nnouns the pronoun points at.\n\nThe pattern is a trigger only: it finds sentence-initial `This/That/It/These/Those` followed by a\nverb, which marks pronoun use rather than a determiner (\"This value\" does not fire). The model then\nadjudicates whether the antecedent is actually ambiguous.\n\nBad:  The parser reads the config and the loader reads the manifest. This is then cached.\nGood: The parser reads the config and the loader reads the manifest. The parsed config is cached.\n\nNot a finding when exactly one antecedent is in scope, when the demonstrator is a determiner (\"This\nfunction returns...\"), or inside a quoted example or code block.\n\n### STR001 str-buried-instruction [warning]\nA critical directive placed mid-document in a long prompt.\n\nA must-follow rule sits in the middle of a long prompt, where retrieval is measurably worse than at either end.\n\nBad:  A long prompt with the only redaction rule stated in the middle of page two.\nGood: The redaction rule stated in the opening constraints block.\n\nNot a finding when the prompt is short or the directive sits at either end.\n\n### STR002 str-example-contradicts-rule [warning]\nA few-shot example that violates a stated rule; the example wins.\n\nAn example breaks a rule the prompt states. The example usually wins over the rule.\n\nBad:  Rule: never use contractions. Example answer: don't do that.\nGood: Rule: never use contractions. Example answer: do not do that.\n\nNot a finding when every example obeys the rule.\n\n### STR003 str-example-label-imbalance [warning]\nA skewed label distribution across few-shot examples; majority-label bias.\n\nFew-shot examples skew toward one label, biasing the model toward the majority.\n\nBad:  Nine positive examples and one negative.\nGood: Five positive and five negative.\n\nNot a finding when the true prior is genuinely skewed.\n\n### STR004 str-example-recency [warning]\nExamples ordered so the last label dominates.\n\nPredictions skew toward the label seen near the end of the prompt.\n\nBad:  Examples ordered pos, pos, neg, neg, neg with all negatives last.\nGood: Examples with interleaved or shuffled labels.\n\nNot a finding when order carries meaning.\n\n### STR005 str-format-leakage [warning]\nIncidental style in examples inferred as a rule.\n\nIncidental style in examples (length, punctuation, hedging) gets read as a requirement.\n\nBad:  Every example answer is one word, though length is not part of the task.\nGood: Examples vary in length so no length rule is implied.\n\nNot a finding when the shared style is the intended contract.\n\n### STR006 str-inconsistent-delimiters [warning]\nMixed separator and heading conventions within one prompt.\n\nHeading and separator styles change within one prompt. Meaning-preserving format shifts move few-shot accuracy.\n\nBad:  ## Step 1, then **Step 2:**, then STEP 3 -.\nGood: ## Step 1, ## Step 2, ## Step 3.\n\nNot a finding when one scheme is used throughout.\n\n### STR007 str-instruction-data-mixing [warning]\nPasted content not fenced off from instructions; injection surface.\n\nPasted data runs straight into instructions, so the reader cannot tell directive from content, and injected text can pose as a directive.\n\nBad:  Summarise this: the pasted text also says to ignore prior instructions.\nGood: Summarise the text inside the <data> tags below.\n\nNot a finding when the data is clearly delimited.\n\n### STR008 str-irrelevant-context [warning]\nBackground that does not bear on the task; distracts the model.\n\nBackground with no effect on the task. Models are measurably distracted by irrelevant context.\n\nBad:  Our company was founded in 1998. Parse this date string.\nGood: Parse this date string: 2026-09-09.\n\nNot a finding when the context constrains the task.\n\n### STR009 str-premise-order [warning]\nFacts ordered against the required reasoning chain.\n\nFacts appear in an order that fights the reasoning chain. Reordering premises alone drops reasoning accuracy.\n\nBad:  The conclusion first, then its three supporting facts out of order.\nGood: The facts in dependency order, conclusion last.\n\nNot a finding when order does not affect the chain.\n\n"
    },
    "spec": {
      "rules": [
        "lex-ambiguous-adverb",
        "lex-comparative",
        "lex-connotation",
        "lex-hedge-stack",
        "lex-loophole",
        "lex-open-ended",
        "lex-overloaded-term",
        "lex-politeness-padding",
        "lex-subjective",
        "lex-superlative",
        "lex-term-drift",
        "lex-undefined-jargon",
        "lex-vague-quantifier",
        "log-contradiction",
        "log-duplicate-directive",
        "log-negation-only",
        "log-no-priority",
        "log-no-success-criteria",
        "log-stale-directive",
        "log-universal-quantifier",
        "log-unspecified-output",
        "prag-curse-of-knowledge",
        "prag-persona-conflict",
        "prag-register-mismatch",
        "prag-unstated-audience",
        "ref-attachment",
        "ref-incomplete",
        "ref-missing-actor",
        "ref-passive-actor",
        "ref-scope-ambiguity",
        "ref-vague-pronoun"
      ],
      "prompt": "### LEX001 lex-ambiguous-adverb [warning]\nManner adverb with no measurable criterion.\n\nAn adverb that names a quality of execution without a threshold. \"Handle errors gracefully\" gives\nthe implementer nothing to check against.\n\nBad:  Handle a dropped connection gracefully.\nGood: On a dropped connection, retry twice with backoff, then surface a `ConnectionError`.\n\nNot a finding inside a quoted example or code block.\n\n### LEX002 lex-comparative [warning]\nComparative with no stated reference point.\n\nA comparative names a direction but no baseline, so nothing says how much or than what. The pattern is a trigger; the model checks whether a reference point is given.\n\nBad:  Make the parser faster.\nGood: Make the parser run in under 100 ms.\n\nNot a finding when a baseline follows (\"faster than the current 200 ms\") or inside a quoted example.\n\n### LEX003 lex-connotation [warning]\nA word importing a register the task never asked for.\n\nA word drags in tone the task did not ask for, nudging the output's register.\n\nBad:  Interrogate the config and brutally trim the output.\nGood: Read the config and remove unused output.\n\nNot a finding when the loaded word is the accurate one.\n\n### LEX004 lex-hedge-stack [warning]\nStacked hedges signal optionality you probably did not intend.\n\nTwo or more hedges in a row (\"could potentially possibly\") weaken an instruction to the point the\nreader treats it as optional. Collapse to one modal or none.\n\nBad:  You could possibly want to validate the token.\nGood: Validate the token.\n\nNot a finding inside a quoted example or code block.\n\n### LEX005 lex-loophole [warning]\nOptional-clause phrase makes the requirement skippable without saying who decides.\n\nPhrases that make a requirement optional without saying who decides or on what condition. The\nreader is licensed to skip the work, and the author keeps deniability that it was ever required.\n\nBad:  Validate the payload where applicable.\nGood: Validate the payload when it contains a `customer_id`.\n\nNot a finding when the deciding condition is stated in the same sentence (e.g. \"if the file\nexists, delete it\"), or when the phrase appears inside a quoted example or code block.\n\n### LEX006 lex-open-ended [warning]\nOpen-ended list leaves the tail of the enumeration undefined.\n\n\"etc.\" in a spec hands the reader the job of completing the list, and two readers complete it\ndifferently.\n\nBad:  Sanitize the input: strip tags, escape quotes, etc.\nGood: Sanitize the input: strip tags, escape quotes, and reject bytes above 0x7F.\n\nNot a finding inside a quoted example or code block.\n\n### LEX007 lex-overloaded-term [warning]\nOne term standing for two distinct concepts.\n\nOne word carrying two meanings in the same document. The reader cannot tell which is meant.\n\nBad:  Load the context from disk, then append the conversation to the context.\nGood: Load the config from disk, then append the message to the history.\n\nNot a finding when both uses share a single meaning.\n\n### LEX008 lex-politeness-padding [suggestion]\nFiller politeness adds tokens and no constraint.\n\nSofteners aimed at a model carry no instruction and cost tokens. Drop them; state the task.\n\nBad:  I was wondering if you could please validate the token.\nGood: Validate the token.\n\nNot a finding inside a quoted example or code block.\n\n### LEX009 lex-subjective [warning]\nSubjective adjective with no shared referent; not verifiable.\n\nAdjectives that assert quality without a testable referent. Two readers disagree on whether the\noutput met the bar.\n\nBad:  Build a user-friendly, robust config loader.\nGood: The loader rejects an unknown key with a named error and loads a 1 MB file in under 50 ms.\n\nNot a finding inside a quoted example or code block.\n\n### LEX010 lex-superlative [warning]\nSuperlative sets an unbounded, unreachable target.\n\nA superlative names a target with no ceiling, so nothing counts as done. \"The\" + best is excluded\nbecause \"best practice\" is idiom; the model pass judges bare \"best\".\n\nBad:  Choose the optimal data structure for the fastest lookup.\nGood: Use a structure with O(1) average lookup; a hash map is fine.\n\nNot a finding inside a quoted example or code block.\n\n### LEX011 lex-term-drift [warning]\nSeveral terms used for one concept; the reader infers a distinction that isn't there.\n\nSeveral words for one concept. The reader applies the principle of contrast and assumes a difference that was never meant.\n\nBad:  Send the user's token, fetch the customer record, update the requester profile.\nGood: Send the user's token, fetch the user's record, update the user's profile.\n\nNot a finding when the terms denote genuinely different roles.\n\n### LEX012 lex-undefined-jargon [warning]\nA domain term or acronym used before it is expanded.\n\nAn acronym or domain term used with no first-use expansion. A reader outside the domain is stuck.\n\nBad:  Set the MTU before the NIC initialises.\nGood: Set the maximum transmission unit (MTU) before the network card initialises.\n\nNot a finding when the term is expanded on first use or is universally known.\n\n### LEX013 lex-vague-quantifier [warning]\nNon-verifiable quantity; give a number or a bound.\n\nA quantity word with no number behind it. \"Sufficient logging\" cannot be checked. Bare \"some\",\n\"several\" and \"many\" are deliberately excluded here because they false-positive too often; the\nmodel pass catches them in context.\n\nBad:  Add sufficient retries and a variety of test cases.\nGood: Add three retries and test the empty, single-item and 10k-item inputs.\n\nNot a finding inside a quoted example or code block.\n\n### LOG002 log-contradiction [warning]\nTwo constraints in one instruction that cannot both hold.\n\nTwo constraints in the same instruction that cannot both hold (\"detailed but concise\", \"casual but\nformal\", \"exhaustive list, keep it short\"). Models rarely flag the conflict or ask which to\nprioritise; they silently blend the two and satisfy neither.\n\nNo reliable surface signal, so this is model-only. \"but\", \"however\" and \"yet\" often join the two\nhalves, but most uses of those words are not contradictions, so they are not a usable trigger.\n\nBad:  Write a detailed but concise summary covering every edge case in two sentences.\nGood: Write a summary of at most three sentences; name the two highest-impact edge cases.\n\nNot a finding when the two constraints apply to different scopes (e.g. \"verbose logs, terse UI\ncopy\"), or when one clause resolves the other (a stated tie-breaker).\n\n### LOG003 log-duplicate-directive [warning]\nThe same rule stated twice; the copies drift on edit.\n\nOne rule said twice in different words. It costs tokens and the two copies drift apart when one is edited.\n\nBad:  Keep it short. Later in the doc: Be concise and don't pad the answer.\nGood: Keep the answer under three sentences.\n\nNot a finding when the two statements cover different scopes.\n\n### LOG006 log-negation-only [warning]\nA prohibition that names no goal and keeps the banned content in context.\n\nA negative instruction names what not to do but not what to do, and the prohibited content stays in context. Larger models do worse on negated prompts. The model checks for a positive target.\n\nBad:  Don't be verbose.\nGood: Keep replies to three sentences.\n\nNot a finding when a positive instruction accompanies the prohibition.\n\n### LOG007 log-no-priority [warning]\nTwo constraints that can conflict at runtime with no tie-breaker.\n\nTwo constraints that will sometimes collide, with nothing saying which wins.\n\nBad:  Be thorough and finish within one paragraph.\nGood: Finish within one paragraph; drop detail before length.\n\nNot a finding when the constraints cannot conflict.\n\n### LOG008 log-no-success-criteria [warning]\nA task with no statement of what a correct output looks like.\n\nA task with no definition of done. Any output is arguably compliant.\n\nBad:  Improve the onboarding docs.\nGood: Rewrite the onboarding docs so a new hire can deploy in under 30 minutes.\n\nNot a finding when success is defined elsewhere in scope.\n\n### LOG009 log-stale-directive [warning]\nReferences a tool, file or step that no longer exists.\n\nAn instruction pointing at something removed. Detecting it needs an inventory of current tools and files.\n\nBad:  Run `make lint` before committing, after `make lint` was deleted.\nGood: Run `npm run lint` before committing.\n\nNot a finding when the referenced item still exists.\n\n### LOG010 log-universal-quantifier [error]\nalways/never attached to something that cannot be guaranteed. In the spec pack this is an error.\n\nA universal claim bound to something the reader cannot actually guarantee. The model checks enforceability.\n\nBad:  Always return within 10 ms.\nGood: Return within 10 ms for inputs under 1 KB.\n\nNot a finding when the universal is genuinely enforceable or bounded.\n\n### LOG011 log-unspecified-output [warning]\nNo format, schema or length contract where a consumer expects one.\n\nNo format, schema, or length given where downstream code will parse the output.\n\nBad:  Return the parsed users.\nGood: Return a JSON array of {id, email} objects.\n\nNot a finding when no consumer needs a fixed shape.\n\n### PRG001 prag-curse-of-knowledge [warning]\nThe author's unstated background is load-bearing for the task.\n\nThe task leans on background only the author holds. The reader cannot act on it.\n\nBad:  Fix it the way we discussed.\nGood: Fix the retry logic to back off exponentially.\n\nNot a finding when the shared context is written down.\n\n### PRG002 prag-persona-conflict [warning]\nAn assigned persona that conflicts with the task.\n\nThe assigned persona pulls against what the task needs.\n\nBad:  You are terse. Now write a full tutorial with worked examples.\nGood: Write a full tutorial with worked examples.\n\nNot a finding when persona and task agree.\n\n### PRG003 prag-register-mismatch [warning]\nAn instruction register implying an output register nobody asked for.\n\nThe instruction's tone implies an output tone the author did not request.\n\nBad:  Casually, produce the formal compliance report.\nGood: Produce the formal compliance report.\n\nNot a finding when the register matches the output.\n\n### PRG004 prag-unstated-audience [warning]\nOutput quality depends on a reader profile the prompt never gives.\n\nThe right output depends on who reads it, and the prompt never says.\n\nBad:  Explain how TLS works.\nGood: Explain how TLS works to a backend engineer new to cryptography.\n\nNot a finding when the audience is stated or does not matter.\n\n### REF001 ref-attachment [warning]\nA modifier attachable to two heads.\n\nA prepositional or relative clause that can attach to two heads, including garden-path readings.\n\nBad:  Log the request from the client that failed.\nGood: Log the request that failed; it came from the client.\n\nNot a finding when only one attachment is grammatically possible.\n\n### REF002 ref-incomplete [warning]\nA reference with no resolvable target.\n\nA pointer to something the reader cannot resolve. The pattern triggers; the model checks whether the target is actually findable.\n\nBad:  Follow the steps in the section above.\nGood: Follow the steps in section 3.2 of this file.\n\nNot a finding when the target is numbered or named unambiguously.\n\n### REF003 ref-missing-actor [error]\nAn instruction with no stated agent or trigger. In the spec pack this is an error.\n\nA requirement with no agent, no condition, or neither. EARS templates exist to force both.\n\nBad:  The cache is cleared on startup.\nGood: The boot script clears the cache on startup.\n\nNot a finding when the actor and trigger are unambiguous in the surrounding section.\n\n### REF004 ref-passive-actor [warning]\nPassive voice that drops the actor.\n\nPassive that omits who acts. Passive alone is fine; passive with no agent leaves the doer unspecified. The model confirms the actor is missing.\n\nBad:  The output should be validated.\nGood: The CI job validates the output.\n\nNot a finding when the actor is named (\"validated by the gateway\") or obvious in context.\n\n### REF005 ref-scope-ambiguity [warning]\nModifier attachment across and/or is undecidable.\n\nA chain of and/or where a modifier could bind to one term or all of them. The model checks whether the grouping is actually ambiguous.\n\nBad:  Delete files that are old and unused or temporary.\nGood: Delete files older than 30 days.\n\nNot a finding when parentheses or wording fix the grouping.\n\n### REF006 ref-vague-pronoun [warning]\nSentence-initial pronoun with an ambiguous or distant antecedent.\n\nA sentence-initial bare demonstrative used as a pronoun (\"This is...\", \"It should...\") whose\nantecedent is ambiguous or distant. The reader, and a model, must guess which of several prior\nnouns the pronoun points at.\n\nThe pattern is a trigger only: it finds sentence-initial `This/That/It/These/Those` followed by a\nverb, which marks pronoun use rather than a determiner (\"This value\" does not fire). The model then\nadjudicates whether the antecedent is actually ambiguous.\n\nBad:  The parser reads the config and the loader reads the manifest. This is then cached.\nGood: The parser reads the config and the loader reads the manifest. The parsed config is cached.\n\nNot a finding when exactly one antecedent is in scope, when the demonstrator is a determiner (\"This\nfunction returns...\"), or inside a quoted example or code block.\n\n"
    },
    "code": {
      "rules": [
        "lex-ambiguous-adverb",
        "lex-comparative",
        "lex-connotation",
        "lex-hedge-stack",
        "lex-loophole",
        "lex-open-ended",
        "lex-overloaded-term",
        "lex-politeness-padding",
        "lex-subjective",
        "lex-superlative",
        "lex-term-drift",
        "lex-undefined-jargon",
        "lex-vague-quantifier",
        "log-contradiction",
        "log-duplicate-directive",
        "log-negation-only",
        "log-no-priority",
        "log-no-success-criteria",
        "log-stale-directive",
        "log-universal-quantifier",
        "log-unspecified-output",
        "prag-curse-of-knowledge",
        "prag-persona-conflict",
        "prag-register-mismatch",
        "prag-unstated-audience",
        "ref-attachment",
        "ref-incomplete",
        "ref-missing-actor",
        "ref-passive-actor",
        "ref-scope-ambiguity",
        "ref-vague-pronoun"
      ],
      "prompt": "### LEX001 lex-ambiguous-adverb [warning]\nManner adverb with no measurable criterion.\n\nAn adverb that names a quality of execution without a threshold. \"Handle errors gracefully\" gives\nthe implementer nothing to check against.\n\nBad:  Handle a dropped connection gracefully.\nGood: On a dropped connection, retry twice with backoff, then surface a `ConnectionError`.\n\nNot a finding inside a quoted example or code block.\n\n### LEX002 lex-comparative [warning]\nComparative with no stated reference point.\n\nA comparative names a direction but no baseline, so nothing says how much or than what. The pattern is a trigger; the model checks whether a reference point is given.\n\nBad:  Make the parser faster.\nGood: Make the parser run in under 100 ms.\n\nNot a finding when a baseline follows (\"faster than the current 200 ms\") or inside a quoted example.\n\n### LEX003 lex-connotation [warning]\nA word importing a register the task never asked for.\n\nA word drags in tone the task did not ask for, nudging the output's register.\n\nBad:  Interrogate the config and brutally trim the output.\nGood: Read the config and remove unused output.\n\nNot a finding when the loaded word is the accurate one.\n\n### LEX004 lex-hedge-stack [warning]\nStacked hedges signal optionality you probably did not intend.\n\nTwo or more hedges in a row (\"could potentially possibly\") weaken an instruction to the point the\nreader treats it as optional. Collapse to one modal or none.\n\nBad:  You could possibly want to validate the token.\nGood: Validate the token.\n\nNot a finding inside a quoted example or code block.\n\n### LEX005 lex-loophole [warning]\nOptional-clause phrase makes the requirement skippable without saying who decides.\n\nPhrases that make a requirement optional without saying who decides or on what condition. The\nreader is licensed to skip the work, and the author keeps deniability that it was ever required.\n\nBad:  Validate the payload where applicable.\nGood: Validate the payload when it contains a `customer_id`.\n\nNot a finding when the deciding condition is stated in the same sentence (e.g. \"if the file\nexists, delete it\"), or when the phrase appears inside a quoted example or code block.\n\n### LEX006 lex-open-ended [warning]\nOpen-ended list leaves the tail of the enumeration undefined.\n\n\"etc.\" in a spec hands the reader the job of completing the list, and two readers complete it\ndifferently.\n\nBad:  Sanitize the input: strip tags, escape quotes, etc.\nGood: Sanitize the input: strip tags, escape quotes, and reject bytes above 0x7F.\n\nNot a finding inside a quoted example or code block.\n\n### LEX007 lex-overloaded-term [warning]\nOne term standing for two distinct concepts.\n\nOne word carrying two meanings in the same document. The reader cannot tell which is meant.\n\nBad:  Load the context from disk, then append the conversation to the context.\nGood: Load the config from disk, then append the message to the history.\n\nNot a finding when both uses share a single meaning.\n\n### LEX008 lex-politeness-padding [suggestion]\nFiller politeness adds tokens and no constraint.\n\nSofteners aimed at a model carry no instruction and cost tokens. Drop them; state the task.\n\nBad:  I was wondering if you could please validate the token.\nGood: Validate the token.\n\nNot a finding inside a quoted example or code block.\n\n### LEX009 lex-subjective [warning]\nSubjective adjective with no shared referent; not verifiable.\n\nAdjectives that assert quality without a testable referent. Two readers disagree on whether the\noutput met the bar.\n\nBad:  Build a user-friendly, robust config loader.\nGood: The loader rejects an unknown key with a named error and loads a 1 MB file in under 50 ms.\n\nNot a finding inside a quoted example or code block.\n\n### LEX010 lex-superlative [warning]\nSuperlative sets an unbounded, unreachable target.\n\nA superlative names a target with no ceiling, so nothing counts as done. \"The\" + best is excluded\nbecause \"best practice\" is idiom; the model pass judges bare \"best\".\n\nBad:  Choose the optimal data structure for the fastest lookup.\nGood: Use a structure with O(1) average lookup; a hash map is fine.\n\nNot a finding inside a quoted example or code block.\n\n### LEX011 lex-term-drift [warning]\nSeveral terms used for one concept; the reader infers a distinction that isn't there.\n\nSeveral words for one concept. The reader applies the principle of contrast and assumes a difference that was never meant.\n\nBad:  Send the user's token, fetch the customer record, update the requester profile.\nGood: Send the user's token, fetch the user's record, update the user's profile.\n\nNot a finding when the terms denote genuinely different roles.\n\n### LEX012 lex-undefined-jargon [warning]\nA domain term or acronym used before it is expanded.\n\nAn acronym or domain term used with no first-use expansion. A reader outside the domain is stuck.\n\nBad:  Set the MTU before the NIC initialises.\nGood: Set the maximum transmission unit (MTU) before the network card initialises.\n\nNot a finding when the term is expanded on first use or is universally known.\n\n### LEX013 lex-vague-quantifier [warning]\nNon-verifiable quantity; give a number or a bound.\n\nA quantity word with no number behind it. \"Sufficient logging\" cannot be checked. Bare \"some\",\n\"several\" and \"many\" are deliberately excluded here because they false-positive too often; the\nmodel pass catches them in context.\n\nBad:  Add sufficient retries and a variety of test cases.\nGood: Add three retries and test the empty, single-item and 10k-item inputs.\n\nNot a finding inside a quoted example or code block.\n\n### LOG002 log-contradiction [warning]\nTwo constraints in one instruction that cannot both hold.\n\nTwo constraints in the same instruction that cannot both hold (\"detailed but concise\", \"casual but\nformal\", \"exhaustive list, keep it short\"). Models rarely flag the conflict or ask which to\nprioritise; they silently blend the two and satisfy neither.\n\nNo reliable surface signal, so this is model-only. \"but\", \"however\" and \"yet\" often join the two\nhalves, but most uses of those words are not contradictions, so they are not a usable trigger.\n\nBad:  Write a detailed but concise summary covering every edge case in two sentences.\nGood: Write a summary of at most three sentences; name the two highest-impact edge cases.\n\nNot a finding when the two constraints apply to different scopes (e.g. \"verbose logs, terse UI\ncopy\"), or when one clause resolves the other (a stated tie-breaker).\n\n### LOG003 log-duplicate-directive [warning]\nThe same rule stated twice; the copies drift on edit.\n\nOne rule said twice in different words. It costs tokens and the two copies drift apart when one is edited.\n\nBad:  Keep it short. Later in the doc: Be concise and don't pad the answer.\nGood: Keep the answer under three sentences.\n\nNot a finding when the two statements cover different scopes.\n\n### LOG006 log-negation-only [warning]\nA prohibition that names no goal and keeps the banned content in context.\n\nA negative instruction names what not to do but not what to do, and the prohibited content stays in context. Larger models do worse on negated prompts. The model checks for a positive target.\n\nBad:  Don't be verbose.\nGood: Keep replies to three sentences.\n\nNot a finding when a positive instruction accompanies the prohibition.\n\n### LOG007 log-no-priority [warning]\nTwo constraints that can conflict at runtime with no tie-breaker.\n\nTwo constraints that will sometimes collide, with nothing saying which wins.\n\nBad:  Be thorough and finish within one paragraph.\nGood: Finish within one paragraph; drop detail before length.\n\nNot a finding when the constraints cannot conflict.\n\n### LOG008 log-no-success-criteria [warning]\nA task with no statement of what a correct output looks like.\n\nA task with no definition of done. Any output is arguably compliant.\n\nBad:  Improve the onboarding docs.\nGood: Rewrite the onboarding docs so a new hire can deploy in under 30 minutes.\n\nNot a finding when success is defined elsewhere in scope.\n\n### LOG009 log-stale-directive [warning]\nReferences a tool, file or step that no longer exists.\n\nAn instruction pointing at something removed. Detecting it needs an inventory of current tools and files.\n\nBad:  Run `make lint` before committing, after `make lint` was deleted.\nGood: Run `npm run lint` before committing.\n\nNot a finding when the referenced item still exists.\n\n### LOG010 log-universal-quantifier [warning]\nalways/never attached to something that cannot be guaranteed. In the spec pack this is an error.\n\nA universal claim bound to something the reader cannot actually guarantee. The model checks enforceability.\n\nBad:  Always return within 10 ms.\nGood: Return within 10 ms for inputs under 1 KB.\n\nNot a finding when the universal is genuinely enforceable or bounded.\n\n### LOG011 log-unspecified-output [warning]\nNo format, schema or length contract where a consumer expects one.\n\nNo format, schema, or length given where downstream code will parse the output.\n\nBad:  Return the parsed users.\nGood: Return a JSON array of {id, email} objects.\n\nNot a finding when no consumer needs a fixed shape.\n\n### PRG001 prag-curse-of-knowledge [warning]\nThe author's unstated background is load-bearing for the task.\n\nThe task leans on background only the author holds. The reader cannot act on it.\n\nBad:  Fix it the way we discussed.\nGood: Fix the retry logic to back off exponentially.\n\nNot a finding when the shared context is written down.\n\n### PRG002 prag-persona-conflict [warning]\nAn assigned persona that conflicts with the task.\n\nThe assigned persona pulls against what the task needs.\n\nBad:  You are terse. Now write a full tutorial with worked examples.\nGood: Write a full tutorial with worked examples.\n\nNot a finding when persona and task agree.\n\n### PRG003 prag-register-mismatch [warning]\nAn instruction register implying an output register nobody asked for.\n\nThe instruction's tone implies an output tone the author did not request.\n\nBad:  Casually, produce the formal compliance report.\nGood: Produce the formal compliance report.\n\nNot a finding when the register matches the output.\n\n### PRG004 prag-unstated-audience [warning]\nOutput quality depends on a reader profile the prompt never gives.\n\nThe right output depends on who reads it, and the prompt never says.\n\nBad:  Explain how TLS works.\nGood: Explain how TLS works to a backend engineer new to cryptography.\n\nNot a finding when the audience is stated or does not matter.\n\n### REF001 ref-attachment [warning]\nA modifier attachable to two heads.\n\nA prepositional or relative clause that can attach to two heads, including garden-path readings.\n\nBad:  Log the request from the client that failed.\nGood: Log the request that failed; it came from the client.\n\nNot a finding when only one attachment is grammatically possible.\n\n### REF002 ref-incomplete [warning]\nA reference with no resolvable target.\n\nA pointer to something the reader cannot resolve. The pattern triggers; the model checks whether the target is actually findable.\n\nBad:  Follow the steps in the section above.\nGood: Follow the steps in section 3.2 of this file.\n\nNot a finding when the target is numbered or named unambiguously.\n\n### REF003 ref-missing-actor [warning]\nAn instruction with no stated agent or trigger. In the spec pack this is an error.\n\nA requirement with no agent, no condition, or neither. EARS templates exist to force both.\n\nBad:  The cache is cleared on startup.\nGood: The boot script clears the cache on startup.\n\nNot a finding when the actor and trigger are unambiguous in the surrounding section.\n\n### REF004 ref-passive-actor [warning]\nPassive voice that drops the actor.\n\nPassive that omits who acts. Passive alone is fine; passive with no agent leaves the doer unspecified. The model confirms the actor is missing.\n\nBad:  The output should be validated.\nGood: The CI job validates the output.\n\nNot a finding when the actor is named (\"validated by the gateway\") or obvious in context.\n\n### REF005 ref-scope-ambiguity [warning]\nModifier attachment across and/or is undecidable.\n\nA chain of and/or where a modifier could bind to one term or all of them. The model checks whether the grouping is actually ambiguous.\n\nBad:  Delete files that are old and unused or temporary.\nGood: Delete files older than 30 days.\n\nNot a finding when parentheses or wording fix the grouping.\n\n### REF006 ref-vague-pronoun [warning]\nSentence-initial pronoun with an ambiguous or distant antecedent.\n\nA sentence-initial bare demonstrative used as a pronoun (\"This is...\", \"It should...\") whose\nantecedent is ambiguous or distant. The reader, and a model, must guess which of several prior\nnouns the pronoun points at.\n\nThe pattern is a trigger only: it finds sentence-initial `This/That/It/These/Those` followed by a\nverb, which marks pronoun use rather than a determiner (\"This value\" does not fire). The model then\nadjudicates whether the antecedent is actually ambiguous.\n\nBad:  The parser reads the config and the loader reads the manifest. This is then cached.\nGood: The parser reads the config and the loader reads the manifest. The parsed config is cached.\n\nNot a finding when exactly one antecedent is in scope, when the demonstrator is a determiner (\"This\nfunction returns...\"), or inside a quoted example or code block.\n\n"
    },
    "all": {
      "rules": [
        "lex-ambiguous-adverb",
        "lex-comparative",
        "lex-connotation",
        "lex-hedge-stack",
        "lex-loophole",
        "lex-open-ended",
        "lex-overloaded-term",
        "lex-politeness-padding",
        "lex-subjective",
        "lex-superlative",
        "lex-term-drift",
        "lex-undefined-jargon",
        "lex-vague-quantifier",
        "log-constraint-overload",
        "log-contradiction",
        "log-duplicate-directive",
        "log-false-presupposition",
        "log-leading-frame",
        "log-negation-only",
        "log-no-priority",
        "log-no-success-criteria",
        "log-stale-directive",
        "log-universal-quantifier",
        "log-unspecified-output",
        "prag-curse-of-knowledge",
        "prag-persona-conflict",
        "prag-register-mismatch",
        "prag-unstated-audience",
        "ref-attachment",
        "ref-incomplete",
        "ref-missing-actor",
        "ref-passive-actor",
        "ref-scope-ambiguity",
        "ref-vague-pronoun",
        "str-buried-instruction",
        "str-example-contradicts-rule",
        "str-example-label-imbalance",
        "str-example-recency",
        "str-format-leakage",
        "str-inconsistent-delimiters",
        "str-instruction-data-mixing",
        "str-irrelevant-context",
        "str-premise-order"
      ],
      "prompt": "### LEX001 lex-ambiguous-adverb [warning]\nManner adverb with no measurable criterion.\n\nAn adverb that names a quality of execution without a threshold. \"Handle errors gracefully\" gives\nthe implementer nothing to check against.\n\nBad:  Handle a dropped connection gracefully.\nGood: On a dropped connection, retry twice with backoff, then surface a `ConnectionError`.\n\nNot a finding inside a quoted example or code block.\n\n### LEX002 lex-comparative [warning]\nComparative with no stated reference point.\n\nA comparative names a direction but no baseline, so nothing says how much or than what. The pattern is a trigger; the model checks whether a reference point is given.\n\nBad:  Make the parser faster.\nGood: Make the parser run in under 100 ms.\n\nNot a finding when a baseline follows (\"faster than the current 200 ms\") or inside a quoted example.\n\n### LEX003 lex-connotation [warning]\nA word importing a register the task never asked for.\n\nA word drags in tone the task did not ask for, nudging the output's register.\n\nBad:  Interrogate the config and brutally trim the output.\nGood: Read the config and remove unused output.\n\nNot a finding when the loaded word is the accurate one.\n\n### LEX004 lex-hedge-stack [warning]\nStacked hedges signal optionality you probably did not intend.\n\nTwo or more hedges in a row (\"could potentially possibly\") weaken an instruction to the point the\nreader treats it as optional. Collapse to one modal or none.\n\nBad:  You could possibly want to validate the token.\nGood: Validate the token.\n\nNot a finding inside a quoted example or code block.\n\n### LEX005 lex-loophole [warning]\nOptional-clause phrase makes the requirement skippable without saying who decides.\n\nPhrases that make a requirement optional without saying who decides or on what condition. The\nreader is licensed to skip the work, and the author keeps deniability that it was ever required.\n\nBad:  Validate the payload where applicable.\nGood: Validate the payload when it contains a `customer_id`.\n\nNot a finding when the deciding condition is stated in the same sentence (e.g. \"if the file\nexists, delete it\"), or when the phrase appears inside a quoted example or code block.\n\n### LEX006 lex-open-ended [warning]\nOpen-ended list leaves the tail of the enumeration undefined.\n\n\"etc.\" in a spec hands the reader the job of completing the list, and two readers complete it\ndifferently.\n\nBad:  Sanitize the input: strip tags, escape quotes, etc.\nGood: Sanitize the input: strip tags, escape quotes, and reject bytes above 0x7F.\n\nNot a finding inside a quoted example or code block.\n\n### LEX007 lex-overloaded-term [warning]\nOne term standing for two distinct concepts.\n\nOne word carrying two meanings in the same document. The reader cannot tell which is meant.\n\nBad:  Load the context from disk, then append the conversation to the context.\nGood: Load the config from disk, then append the message to the history.\n\nNot a finding when both uses share a single meaning.\n\n### LEX008 lex-politeness-padding [suggestion]\nFiller politeness adds tokens and no constraint.\n\nSofteners aimed at a model carry no instruction and cost tokens. Drop them; state the task.\n\nBad:  I was wondering if you could please validate the token.\nGood: Validate the token.\n\nNot a finding inside a quoted example or code block.\n\n### LEX009 lex-subjective [warning]\nSubjective adjective with no shared referent; not verifiable.\n\nAdjectives that assert quality without a testable referent. Two readers disagree on whether the\noutput met the bar.\n\nBad:  Build a user-friendly, robust config loader.\nGood: The loader rejects an unknown key with a named error and loads a 1 MB file in under 50 ms.\n\nNot a finding inside a quoted example or code block.\n\n### LEX010 lex-superlative [warning]\nSuperlative sets an unbounded, unreachable target.\n\nA superlative names a target with no ceiling, so nothing counts as done. \"The\" + best is excluded\nbecause \"best practice\" is idiom; the model pass judges bare \"best\".\n\nBad:  Choose the optimal data structure for the fastest lookup.\nGood: Use a structure with O(1) average lookup; a hash map is fine.\n\nNot a finding inside a quoted example or code block.\n\n### LEX011 lex-term-drift [warning]\nSeveral terms used for one concept; the reader infers a distinction that isn't there.\n\nSeveral words for one concept. The reader applies the principle of contrast and assumes a difference that was never meant.\n\nBad:  Send the user's token, fetch the customer record, update the requester profile.\nGood: Send the user's token, fetch the user's record, update the user's profile.\n\nNot a finding when the terms denote genuinely different roles.\n\n### LEX012 lex-undefined-jargon [warning]\nA domain term or acronym used before it is expanded.\n\nAn acronym or domain term used with no first-use expansion. A reader outside the domain is stuck.\n\nBad:  Set the MTU before the NIC initialises.\nGood: Set the maximum transmission unit (MTU) before the network card initialises.\n\nNot a finding when the term is expanded on first use or is universally known.\n\n### LEX013 lex-vague-quantifier [warning]\nNon-verifiable quantity; give a number or a bound.\n\nA quantity word with no number behind it. \"Sufficient logging\" cannot be checked. Bare \"some\",\n\"several\" and \"many\" are deliberately excluded here because they false-positive too often; the\nmodel pass catches them in context.\n\nBad:  Add sufficient retries and a variety of test cases.\nGood: Add three retries and test the empty, single-item and 10k-item inputs.\n\nNot a finding inside a quoted example or code block.\n\n### LOG001 log-constraint-overload [warning]\nSo many simultaneous constraints that the all-satisfied rate collapses.\n\nPer-constraint accuracy holds while the all-constraints-satisfied rate falls as the count rises. Count the independent constraints in one instruction.\n\nBad:  Reply in JSON, under 50 words, in French, no numerals, cite two sources, and rhyme.\nGood: Reply in JSON with a summary field under 50 words.\n\nNot a finding when the constraints are few or independent.\n\n### LOG002 log-contradiction [warning]\nTwo constraints in one instruction that cannot both hold.\n\nTwo constraints in the same instruction that cannot both hold (\"detailed but concise\", \"casual but\nformal\", \"exhaustive list, keep it short\"). Models rarely flag the conflict or ask which to\nprioritise; they silently blend the two and satisfy neither.\n\nNo reliable surface signal, so this is model-only. \"but\", \"however\" and \"yet\" often join the two\nhalves, but most uses of those words are not contradictions, so they are not a usable trigger.\n\nBad:  Write a detailed but concise summary covering every edge case in two sentences.\nGood: Write a summary of at most three sentences; name the two highest-impact edge cases.\n\nNot a finding when the two constraints apply to different scopes (e.g. \"verbose logs, terse UI\ncopy\"), or when one clause resolves the other (a stated tie-breaker).\n\n### LOG003 log-duplicate-directive [warning]\nThe same rule stated twice; the copies drift on edit.\n\nOne rule said twice in different words. It costs tokens and the two copies drift apart when one is edited.\n\nBad:  Keep it short. Later in the doc: Be concise and don't pad the answer.\nGood: Keep the answer under three sentences.\n\nNot a finding when the two statements cover different scopes.\n\n### LOG004 log-false-presupposition [warning]\nThe instruction presupposes a fact not established; invites confabulation.\n\nThe instruction takes an unestablished fact as given, so the model confabulates a reason rather than checking.\n\nBad:  Explain why the cache lookup fails.\nGood: Check whether the cache lookup fails; if it does, explain why.\n\nNot a finding when the presupposed fact is established earlier.\n\n### LOG005 log-leading-frame [warning]\nFraming that pushes agreement over assessment.\n\nWording that asks the reader to agree rather than assess. The model checks whether the frame presumes the answer.\n\nBad:  Confirm that this design is correct.\nGood: Assess whether this design is correct.\n\nNot a finding when the framing is neutral.\n\n### LOG006 log-negation-only [warning]\nA prohibition that names no goal and keeps the banned content in context.\n\nA negative instruction names what not to do but not what to do, and the prohibited content stays in context. Larger models do worse on negated prompts. The model checks for a positive target.\n\nBad:  Don't be verbose.\nGood: Keep replies to three sentences.\n\nNot a finding when a positive instruction accompanies the prohibition.\n\n### LOG007 log-no-priority [warning]\nTwo constraints that can conflict at runtime with no tie-breaker.\n\nTwo constraints that will sometimes collide, with nothing saying which wins.\n\nBad:  Be thorough and finish within one paragraph.\nGood: Finish within one paragraph; drop detail before length.\n\nNot a finding when the constraints cannot conflict.\n\n### LOG008 log-no-success-criteria [warning]\nA task with no statement of what a correct output looks like.\n\nA task with no definition of done. Any output is arguably compliant.\n\nBad:  Improve the onboarding docs.\nGood: Rewrite the onboarding docs so a new hire can deploy in under 30 minutes.\n\nNot a finding when success is defined elsewhere in scope.\n\n### LOG009 log-stale-directive [warning]\nReferences a tool, file or step that no longer exists.\n\nAn instruction pointing at something removed. Detecting it needs an inventory of current tools and files.\n\nBad:  Run `make lint` before committing, after `make lint` was deleted.\nGood: Run `npm run lint` before committing.\n\nNot a finding when the referenced item still exists.\n\n### LOG010 log-universal-quantifier [warning]\nalways/never attached to something that cannot be guaranteed. In the spec pack this is an error.\n\nA universal claim bound to something the reader cannot actually guarantee. The model checks enforceability.\n\nBad:  Always return within 10 ms.\nGood: Return within 10 ms for inputs under 1 KB.\n\nNot a finding when the universal is genuinely enforceable or bounded.\n\n### LOG011 log-unspecified-output [warning]\nNo format, schema or length contract where a consumer expects one.\n\nNo format, schema, or length given where downstream code will parse the output.\n\nBad:  Return the parsed users.\nGood: Return a JSON array of {id, email} objects.\n\nNot a finding when no consumer needs a fixed shape.\n\n### PRG001 prag-curse-of-knowledge [warning]\nThe author's unstated background is load-bearing for the task.\n\nThe task leans on background only the author holds. The reader cannot act on it.\n\nBad:  Fix it the way we discussed.\nGood: Fix the retry logic to back off exponentially.\n\nNot a finding when the shared context is written down.\n\n### PRG002 prag-persona-conflict [warning]\nAn assigned persona that conflicts with the task.\n\nThe assigned persona pulls against what the task needs.\n\nBad:  You are terse. Now write a full tutorial with worked examples.\nGood: Write a full tutorial with worked examples.\n\nNot a finding when persona and task agree.\n\n### PRG003 prag-register-mismatch [warning]\nAn instruction register implying an output register nobody asked for.\n\nThe instruction's tone implies an output tone the author did not request.\n\nBad:  Casually, produce the formal compliance report.\nGood: Produce the formal compliance report.\n\nNot a finding when the register matches the output.\n\n### PRG004 prag-unstated-audience [warning]\nOutput quality depends on a reader profile the prompt never gives.\n\nThe right output depends on who reads it, and the prompt never says.\n\nBad:  Explain how TLS works.\nGood: Explain how TLS works to a backend engineer new to cryptography.\n\nNot a finding when the audience is stated or does not matter.\n\n### REF001 ref-attachment [warning]\nA modifier attachable to two heads.\n\nA prepositional or relative clause that can attach to two heads, including garden-path readings.\n\nBad:  Log the request from the client that failed.\nGood: Log the request that failed; it came from the client.\n\nNot a finding when only one attachment is grammatically possible.\n\n### REF002 ref-incomplete [warning]\nA reference with no resolvable target.\n\nA pointer to something the reader cannot resolve. The pattern triggers; the model checks whether the target is actually findable.\n\nBad:  Follow the steps in the section above.\nGood: Follow the steps in section 3.2 of this file.\n\nNot a finding when the target is numbered or named unambiguously.\n\n### REF003 ref-missing-actor [warning]\nAn instruction with no stated agent or trigger. In the spec pack this is an error.\n\nA requirement with no agent, no condition, or neither. EARS templates exist to force both.\n\nBad:  The cache is cleared on startup.\nGood: The boot script clears the cache on startup.\n\nNot a finding when the actor and trigger are unambiguous in the surrounding section.\n\n### REF004 ref-passive-actor [warning]\nPassive voice that drops the actor.\n\nPassive that omits who acts. Passive alone is fine; passive with no agent leaves the doer unspecified. The model confirms the actor is missing.\n\nBad:  The output should be validated.\nGood: The CI job validates the output.\n\nNot a finding when the actor is named (\"validated by the gateway\") or obvious in context.\n\n### REF005 ref-scope-ambiguity [warning]\nModifier attachment across and/or is undecidable.\n\nA chain of and/or where a modifier could bind to one term or all of them. The model checks whether the grouping is actually ambiguous.\n\nBad:  Delete files that are old and unused or temporary.\nGood: Delete files older than 30 days.\n\nNot a finding when parentheses or wording fix the grouping.\n\n### REF006 ref-vague-pronoun [warning]\nSentence-initial pronoun with an ambiguous or distant antecedent.\n\nA sentence-initial bare demonstrative used as a pronoun (\"This is...\", \"It should...\") whose\nantecedent is ambiguous or distant. The reader, and a model, must guess which of several prior\nnouns the pronoun points at.\n\nThe pattern is a trigger only: it finds sentence-initial `This/That/It/These/Those` followed by a\nverb, which marks pronoun use rather than a determiner (\"This value\" does not fire). The model then\nadjudicates whether the antecedent is actually ambiguous.\n\nBad:  The parser reads the config and the loader reads the manifest. This is then cached.\nGood: The parser reads the config and the loader reads the manifest. The parsed config is cached.\n\nNot a finding when exactly one antecedent is in scope, when the demonstrator is a determiner (\"This\nfunction returns...\"), or inside a quoted example or code block.\n\n### STR001 str-buried-instruction [warning]\nA critical directive placed mid-document in a long prompt.\n\nA must-follow rule sits in the middle of a long prompt, where retrieval is measurably worse than at either end.\n\nBad:  A long prompt with the only redaction rule stated in the middle of page two.\nGood: The redaction rule stated in the opening constraints block.\n\nNot a finding when the prompt is short or the directive sits at either end.\n\n### STR002 str-example-contradicts-rule [warning]\nA few-shot example that violates a stated rule; the example wins.\n\nAn example breaks a rule the prompt states. The example usually wins over the rule.\n\nBad:  Rule: never use contractions. Example answer: don't do that.\nGood: Rule: never use contractions. Example answer: do not do that.\n\nNot a finding when every example obeys the rule.\n\n### STR003 str-example-label-imbalance [warning]\nA skewed label distribution across few-shot examples; majority-label bias.\n\nFew-shot examples skew toward one label, biasing the model toward the majority.\n\nBad:  Nine positive examples and one negative.\nGood: Five positive and five negative.\n\nNot a finding when the true prior is genuinely skewed.\n\n### STR004 str-example-recency [warning]\nExamples ordered so the last label dominates.\n\nPredictions skew toward the label seen near the end of the prompt.\n\nBad:  Examples ordered pos, pos, neg, neg, neg with all negatives last.\nGood: Examples with interleaved or shuffled labels.\n\nNot a finding when order carries meaning.\n\n### STR005 str-format-leakage [warning]\nIncidental style in examples inferred as a rule.\n\nIncidental style in examples (length, punctuation, hedging) gets read as a requirement.\n\nBad:  Every example answer is one word, though length is not part of the task.\nGood: Examples vary in length so no length rule is implied.\n\nNot a finding when the shared style is the intended contract.\n\n### STR006 str-inconsistent-delimiters [warning]\nMixed separator and heading conventions within one prompt.\n\nHeading and separator styles change within one prompt. Meaning-preserving format shifts move few-shot accuracy.\n\nBad:  ## Step 1, then **Step 2:**, then STEP 3 -.\nGood: ## Step 1, ## Step 2, ## Step 3.\n\nNot a finding when one scheme is used throughout.\n\n### STR007 str-instruction-data-mixing [warning]\nPasted content not fenced off from instructions; injection surface.\n\nPasted data runs straight into instructions, so the reader cannot tell directive from content, and injected text can pose as a directive.\n\nBad:  Summarise this: the pasted text also says to ignore prior instructions.\nGood: Summarise the text inside the <data> tags below.\n\nNot a finding when the data is clearly delimited.\n\n### STR008 str-irrelevant-context [warning]\nBackground that does not bear on the task; distracts the model.\n\nBackground with no effect on the task. Models are measurably distracted by irrelevant context.\n\nBad:  Our company was founded in 1998. Parse this date string.\nGood: Parse this date string: 2026-09-09.\n\nNot a finding when the context constrains the task.\n\n### STR009 str-premise-order [warning]\nFacts ordered against the required reasoning chain.\n\nFacts appear in an order that fights the reasoning chain. Reordering premises alone drops reasoning accuracy.\n\nBad:  The conclusion first, then its three supporting facts out of order.\nGood: The facts in dependency order, conclusion last.\n\nNot a finding when order does not affect the chain.\n\n"
    }
  },
  "rules": [
    {
      "id": "lex-ai-vocab",
      "code": "LEX015",
      "name": "AI-vocab banned word",
      "family": "lexical",
      "applies_to": [
        "core"
      ],
      "severity": "warning",
      "message": "Banned AI-vocab word. Use the plain word (leverage/utilize to use, facilitate to help).",
      "fix": "manual",
      "evidence": "RE",
      "llm_exempt": true,
      "sniffers": [
        {
          "kind": "vale",
          "pattern": "\\b(delve|delved|delving|delves|leverage|leverages|leveraged|leveraging|utilize|utilizes|utilized|utilizing|crucial|seamless|seamlessly|robust|robustly|underscore|underscores|underscored|underscoring|showcase|showcases|showcased|showcasing|foster|fosters|fostered|fostering|tapestry|pivotal|groundbreaking|vibrant|stunning|facilitate|facilitates|facilitated|facilitating|genuinely)\\b",
          "confidence": "high",
          "hook_safe": true,
          "precision": 1.0,
          "n": 0
        }
      ],
      "guidance": "Words that mark text as AI-generated. Banned outright; any occurrence is a violation.\nReach for the plain word: leverage/utilize become \"use\", facilitate becomes \"help\", crucial becomes\n\"key\" or drop it.\n\nBad:  We leverage caching to facilitate faster reads.\nGood: Caching makes reads faster.\n\nNot a finding inside a quoted example or code block."
    },
    {
      "id": "lex-ambiguous-adverb",
      "code": "LEX001",
      "name": "Ambiguous adverb",
      "family": "lexical",
      "applies_to": [
        "core"
      ],
      "severity": "warning",
      "message": "Manner adverb with no measurable criterion.",
      "fix": "manual",
      "evidence": "ISO",
      "llm_exempt": false,
      "sniffers": [
        {
          "kind": "vale",
          "pattern": "\\b(quickly|properly|carefully|appropriately|reasonably|efficiently|gracefully|adequately)\\b",
          "confidence": "high",
          "hook_safe": true,
          "precision": 1.0,
          "n": 30
        },
        {
          "kind": "llm",
          "confidence": "medium",
          "hook_safe": false
        }
      ],
      "guidance": "An adverb that names a quality of execution without a threshold. \"Handle errors gracefully\" gives\nthe implementer nothing to check against.\n\nBad:  Handle a dropped connection gracefully.\nGood: On a dropped connection, retry twice with backoff, then surface a `ConnectionError`.\n\nNot a finding inside a quoted example or code block."
    },
    {
      "id": "lex-comparative",
      "code": "LEX002",
      "name": "Comparative without baseline",
      "family": "lexical",
      "applies_to": [
        "core"
      ],
      "severity": "warning",
      "message": "Comparative with no stated reference point.",
      "fix": "manual",
      "evidence": "ISO",
      "llm_exempt": false,
      "sniffers": [
        {
          "kind": "vale",
          "pattern": "\\b(faster|slower|better|worse|cheaper|easier|harder|quicker|lighter|simpler|stronger|smaller|larger|bigger)\\b",
          "confidence": "low",
          "hook_safe": false
        },
        {
          "kind": "llm",
          "confidence": "medium",
          "hook_safe": false
        }
      ],
      "guidance": "A comparative names a direction but no baseline, so nothing says how much or than what. The pattern is a trigger; the model checks whether a reference point is given.\n\nBad:  Make the parser faster.\nGood: Make the parser run in under 100 ms.\n\nNot a finding when a baseline follows (\"faster than the current 200 ms\") or inside a quoted example."
    },
    {
      "id": "lex-connotation",
      "code": "LEX003",
      "name": "Connotation load",
      "family": "lexical",
      "applies_to": [
        "core"
      ],
      "severity": "warning",
      "message": "A word importing a register the task never asked for.",
      "fix": "manual",
      "evidence": "prac",
      "llm_exempt": false,
      "sniffers": [
        {
          "kind": "llm",
          "confidence": "medium",
          "hook_safe": false
        }
      ],
      "guidance": "A word drags in tone the task did not ask for, nudging the output's register.\n\nBad:  Interrogate the config and brutally trim the output.\nGood: Read the config and remove unused output.\n\nNot a finding when the loaded word is the accurate one."
    },
    {
      "id": "lex-em-dash",
      "code": "LEX014",
      "name": "Em or en dash",
      "family": "lexical",
      "applies_to": [
        "core"
      ],
      "severity": "warning",
      "message": "Em or en dash; banned. Use a period or comma.",
      "fix": "manual",
      "evidence": "RE",
      "llm_exempt": true,
      "sniffers": [
        {
          "kind": "vale",
          "pattern": "[\u2014\u2013]",
          "confidence": "high",
          "hook_safe": true,
          "precision": 1.0,
          "n": 0
        }
      ],
      "guidance": "The em dash and en dash are banned. Split the clause with a period, or join it with a comma.\nDo not swap one dash for the other, and do not use a spaced hyphen as a stand-in.\n\nBad:  The migration cut latency in half \u2014 a result no one expected.\nGood: The migration cut latency in half, a result no one expected.\n\nNot a finding inside a quoted example or code block."
    },
    {
      "id": "lex-hedge-stack",
      "code": "LEX004",
      "name": "Hedging stack",
      "family": "lexical",
      "applies_to": [
        "core"
      ],
      "severity": "warning",
      "message": "Stacked hedges signal optionality you probably did not intend.",
      "fix": "auto",
      "evidence": "prac",
      "llm_exempt": false,
      "sniffers": [
        {
          "kind": "vale",
          "pattern": "\\b(could|can|may|might|would)[[:space:]]+(potentially|possibly|perhaps|probably|maybe)\\b|\\b(potentially|possibly|perhaps|probably|maybe)[[:space:]]+(potentially|possibly|perhaps|probably|maybe)\\b",
          "confidence": "high",
          "hook_safe": false
        },
        {
          "kind": "llm",
          "confidence": "medium",
          "hook_safe": false
        }
      ],
      "guidance": "Two or more hedges in a row (\"could potentially possibly\") weaken an instruction to the point the\nreader treats it as optional. Collapse to one modal or none.\n\nBad:  You could possibly want to validate the token.\nGood: Validate the token.\n\nNot a finding inside a quoted example or code block."
    },
    {
      "id": "lex-loophole",
      "code": "LEX005",
      "name": "Loophole or escape clause",
      "family": "lexical",
      "applies_to": [
        "core"
      ],
      "severity": "warning",
      "message": "Optional-clause phrase makes the requirement skippable without saying who decides.",
      "fix": "manual",
      "evidence": "ISO",
      "llm_exempt": false,
      "sniffers": [
        {
          "kind": "vale",
          "pattern": "\\b(if possible|where applicable|as appropriate|as needed|if necessary|when feasible)\\b",
          "confidence": "high",
          "hook_safe": false,
          "precision": 0.95,
          "n": 19
        },
        {
          "kind": "llm",
          "confidence": "medium",
          "hook_safe": false
        }
      ],
      "guidance": "Phrases that make a requirement optional without saying who decides or on what condition. The\nreader is licensed to skip the work, and the author keeps deniability that it was ever required.\n\nBad:  Validate the payload where applicable.\nGood: Validate the payload when it contains a `customer_id`.\n\nNot a finding when the deciding condition is stated in the same sentence (e.g. \"if the file\nexists, delete it\"), or when the phrase appears inside a quoted example or code block."
    },
    {
      "id": "lex-open-ended",
      "code": "LEX006",
      "name": "Open-ended enumeration",
      "family": "lexical",
      "applies_to": [
        "core"
      ],
      "severity": "warning",
      "message": "Open-ended list leaves the tail of the enumeration undefined.",
      "fix": "manual",
      "evidence": "ISO",
      "llm_exempt": false,
      "sniffers": [
        {
          "kind": "vale",
          "pattern": "(\\betc\\b|\\band so on\\b|\\band so forth\\b|\\bamong others\\b|\\bamong other things\\b)",
          "confidence": "high",
          "hook_safe": true,
          "precision": 1.0,
          "n": 30
        },
        {
          "kind": "llm",
          "confidence": "medium",
          "hook_safe": false
        }
      ],
      "guidance": "\"etc.\" in a spec hands the reader the job of completing the list, and two readers complete it\ndifferently.\n\nBad:  Sanitize the input: strip tags, escape quotes, etc.\nGood: Sanitize the input: strip tags, escape quotes, and reject bytes above 0x7F.\n\nNot a finding inside a quoted example or code block."
    },
    {
      "id": "lex-overloaded-term",
      "code": "LEX007",
      "name": "Overloaded term",
      "family": "lexical",
      "applies_to": [
        "core"
      ],
      "severity": "warning",
      "message": "One term standing for two distinct concepts.",
      "fix": "manual",
      "evidence": "RE",
      "llm_exempt": false,
      "sniffers": [
        {
          "kind": "llm",
          "confidence": "medium",
          "hook_safe": false
        }
      ],
      "guidance": "One word carrying two meanings in the same document. The reader cannot tell which is meant.\n\nBad:  Load the context from disk, then append the conversation to the context.\nGood: Load the config from disk, then append the message to the history.\n\nNot a finding when both uses share a single meaning."
    },
    {
      "id": "lex-politeness-padding",
      "code": "LEX008",
      "name": "Politeness padding",
      "family": "lexical",
      "applies_to": [
        "core"
      ],
      "severity": "suggestion",
      "message": "Filler politeness adds tokens and no constraint.",
      "fix": "auto",
      "evidence": "prac",
      "llm_exempt": false,
      "sniffers": [
        {
          "kind": "vale",
          "pattern": "\\b(I'?d (really )?appreciate|if you could,? please|would you mind|I was wondering if|it would be great if|if it'?s not too much trouble|please kindly)\\b",
          "confidence": "high",
          "hook_safe": false
        },
        {
          "kind": "llm",
          "confidence": "medium",
          "hook_safe": false
        }
      ],
      "guidance": "Softeners aimed at a model carry no instruction and cost tokens. Drop them; state the task.\n\nBad:  I was wondering if you could please validate the token.\nGood: Validate the token.\n\nNot a finding inside a quoted example or code block."
    },
    {
      "id": "lex-subjective",
      "code": "LEX009",
      "name": "Subjective language",
      "family": "lexical",
      "applies_to": [
        "core"
      ],
      "severity": "warning",
      "message": "Subjective adjective with no shared referent; not verifiable.",
      "fix": "manual",
      "evidence": "ISO",
      "llm_exempt": false,
      "sniffers": [
        {
          "kind": "vale",
          "pattern": "\\b(user-friendly|user friendly|easy to use|easy-to-use|intuitive|seamless|cost-effective|state of the art|state-of-the-art|scalable|flexible|robust|elegant|ergonomic)\\b",
          "confidence": "medium",
          "hook_safe": false,
          "precision": 0.76,
          "n": 29
        },
        {
          "kind": "llm",
          "confidence": "medium",
          "hook_safe": false
        }
      ],
      "guidance": "Adjectives that assert quality without a testable referent. Two readers disagree on whether the\noutput met the bar.\n\nBad:  Build a user-friendly, robust config loader.\nGood: The loader rejects an unknown key with a named error and loads a 1 MB file in under 50 ms.\n\nNot a finding inside a quoted example or code block."
    },
    {
      "id": "lex-superlative",
      "code": "LEX010",
      "name": "Superlative",
      "family": "lexical",
      "applies_to": [
        "core"
      ],
      "severity": "warning",
      "message": "Superlative sets an unbounded, unreachable target.",
      "fix": "manual",
      "evidence": "ISO",
      "llm_exempt": false,
      "sniffers": [
        {
          "kind": "vale",
          "pattern": "\\b(optimal|ideal|fastest|cleanest|simplest|smartest|strongest|world-class|top-notch|best-in-class)\\b",
          "confidence": "medium",
          "hook_safe": false
        },
        {
          "kind": "llm",
          "confidence": "medium",
          "hook_safe": false
        }
      ],
      "guidance": "A superlative names a target with no ceiling, so nothing counts as done. \"The\" + best is excluded\nbecause \"best practice\" is idiom; the model pass judges bare \"best\".\n\nBad:  Choose the optimal data structure for the fastest lookup.\nGood: Use a structure with O(1) average lookup; a hash map is fine.\n\nNot a finding inside a quoted example or code block."
    },
    {
      "id": "lex-term-drift",
      "code": "LEX011",
      "name": "Terminology drift",
      "family": "lexical",
      "applies_to": [
        "core"
      ],
      "severity": "warning",
      "message": "Several terms used for one concept; the reader infers a distinction that isn't there.",
      "fix": "arg",
      "evidence": "RE",
      "llm_exempt": false,
      "sniffers": [
        {
          "kind": "llm",
          "confidence": "medium",
          "hook_safe": false
        }
      ],
      "guidance": "Several words for one concept. The reader applies the principle of contrast and assumes a difference that was never meant.\n\nBad:  Send the user's token, fetch the customer record, update the requester profile.\nGood: Send the user's token, fetch the user's record, update the user's profile.\n\nNot a finding when the terms denote genuinely different roles."
    },
    {
      "id": "lex-undefined-jargon",
      "code": "LEX012",
      "name": "Undefined jargon",
      "family": "lexical",
      "applies_to": [
        "core"
      ],
      "severity": "warning",
      "message": "A domain term or acronym used before it is expanded.",
      "fix": "arg",
      "evidence": "ISO",
      "llm_exempt": false,
      "sniffers": [
        {
          "kind": "llm",
          "confidence": "medium",
          "hook_safe": false
        }
      ],
      "guidance": "An acronym or domain term used with no first-use expansion. A reader outside the domain is stuck.\n\nBad:  Set the MTU before the NIC initialises.\nGood: Set the maximum transmission unit (MTU) before the network card initialises.\n\nNot a finding when the term is expanded on first use or is universally known."
    },
    {
      "id": "lex-vague-quantifier",
      "code": "LEX013",
      "name": "Vague quantifier",
      "family": "lexical",
      "applies_to": [
        "core"
      ],
      "severity": "warning",
      "message": "Non-verifiable quantity; give a number or a bound.",
      "fix": "manual",
      "evidence": "ISO",
      "llm_exempt": false,
      "sniffers": [
        {
          "kind": "vale",
          "pattern": "\\b(as (much|many|little) as possible|a (large|small|certain|good) number of|a variety of|numerous|sufficient|adequate)\\b",
          "confidence": "high",
          "hook_safe": true,
          "precision": 0.95,
          "n": 30
        },
        {
          "kind": "llm",
          "confidence": "medium",
          "hook_safe": false
        }
      ],
      "guidance": "A quantity word with no number behind it. \"Sufficient logging\" cannot be checked. Bare \"some\",\n\"several\" and \"many\" are deliberately excluded here because they false-positive too often; the\nmodel pass catches them in context.\n\nBad:  Add sufficient retries and a variety of test cases.\nGood: Add three retries and test the empty, single-item and 10k-item inputs.\n\nNot a finding inside a quoted example or code block."
    },
    {
      "id": "log-constraint-overload",
      "code": "LOG001",
      "name": "Constraint overload",
      "family": "logical",
      "applies_to": [
        "prompt"
      ],
      "severity": "warning",
      "message": "So many simultaneous constraints that the all-satisfied rate collapses.",
      "fix": "manual",
      "evidence": "LLM",
      "llm_exempt": false,
      "sniffers": [
        {
          "kind": "llm",
          "confidence": "medium",
          "hook_safe": false
        }
      ],
      "guidance": "Per-constraint accuracy holds while the all-constraints-satisfied rate falls as the count rises. Count the independent constraints in one instruction.\n\nBad:  Reply in JSON, under 50 words, in French, no numerals, cite two sources, and rhyme.\nGood: Reply in JSON with a summary field under 50 words.\n\nNot a finding when the constraints are few or independent."
    },
    {
      "id": "log-contradiction",
      "code": "LOG002",
      "name": "Contradictory constraints",
      "family": "logical",
      "applies_to": [
        "core"
      ],
      "severity": "warning",
      "message": "Two constraints in one instruction that cannot both hold.",
      "fix": "manual",
      "evidence": "LLM",
      "llm_exempt": false,
      "sniffers": [
        {
          "kind": "llm",
          "confidence": "medium",
          "hook_safe": false
        }
      ],
      "guidance": "Two constraints in the same instruction that cannot both hold (\"detailed but concise\", \"casual but\nformal\", \"exhaustive list, keep it short\"). Models rarely flag the conflict or ask which to\nprioritise; they silently blend the two and satisfy neither.\n\nNo reliable surface signal, so this is model-only. \"but\", \"however\" and \"yet\" often join the two\nhalves, but most uses of those words are not contradictions, so they are not a usable trigger.\n\nBad:  Write a detailed but concise summary covering every edge case in two sentences.\nGood: Write a summary of at most three sentences; name the two highest-impact edge cases.\n\nNot a finding when the two constraints apply to different scopes (e.g. \"verbose logs, terse UI\ncopy\"), or when one clause resolves the other (a stated tie-breaker)."
    },
    {
      "id": "log-duplicate-directive",
      "code": "LOG003",
      "name": "Restated directive",
      "family": "logical",
      "applies_to": [
        "core"
      ],
      "severity": "warning",
      "message": "The same rule stated twice; the copies drift on edit.",
      "fix": "manual",
      "evidence": "prac",
      "llm_exempt": false,
      "sniffers": [
        {
          "kind": "llm",
          "confidence": "medium",
          "hook_safe": false
        }
      ],
      "guidance": "One rule said twice in different words. It costs tokens and the two copies drift apart when one is edited.\n\nBad:  Keep it short. Later in the doc: Be concise and don't pad the answer.\nGood: Keep the answer under three sentences.\n\nNot a finding when the two statements cover different scopes."
    },
    {
      "id": "log-false-presupposition",
      "code": "LOG004",
      "name": "False presupposition",
      "family": "logical",
      "applies_to": [
        "prompt"
      ],
      "severity": "warning",
      "message": "The instruction presupposes a fact not established; invites confabulation.",
      "fix": "manual",
      "evidence": "LLM",
      "llm_exempt": false,
      "sniffers": [
        {
          "kind": "llm",
          "confidence": "medium",
          "hook_safe": false
        }
      ],
      "guidance": "The instruction takes an unestablished fact as given, so the model confabulates a reason rather than checking.\n\nBad:  Explain why the cache lookup fails.\nGood: Check whether the cache lookup fails; if it does, explain why.\n\nNot a finding when the presupposed fact is established earlier."
    },
    {
      "id": "log-leading-frame",
      "code": "LOG005",
      "name": "Leading framing",
      "family": "logical",
      "applies_to": [
        "prompt"
      ],
      "severity": "warning",
      "message": "Framing that pushes agreement over assessment.",
      "fix": "manual",
      "evidence": "LLM",
      "llm_exempt": false,
      "sniffers": [
        {
          "kind": "vale",
          "pattern": "\\b(confirm that|you.?ll agree|as we all know|as we know|obviously|of course,|as you can see|clearly,)\\b",
          "confidence": "medium",
          "hook_safe": false
        },
        {
          "kind": "llm",
          "confidence": "medium",
          "hook_safe": false
        }
      ],
      "guidance": "Wording that asks the reader to agree rather than assess. The model checks whether the frame presumes the answer.\n\nBad:  Confirm that this design is correct.\nGood: Assess whether this design is correct.\n\nNot a finding when the framing is neutral."
    },
    {
      "id": "log-negation-only",
      "code": "LOG006",
      "name": "Negation without positive target",
      "family": "logical",
      "applies_to": [
        "core"
      ],
      "severity": "warning",
      "message": "A prohibition that names no goal and keeps the banned content in context.",
      "fix": "manual",
      "evidence": "LLM",
      "llm_exempt": false,
      "sniffers": [
        {
          "kind": "llm",
          "confidence": "medium",
          "hook_safe": false
        }
      ],
      "guidance": "A negative instruction names what not to do but not what to do, and the prohibited content stays in context. Larger models do worse on negated prompts. The model checks for a positive target.\n\nBad:  Don't be verbose.\nGood: Keep replies to three sentences.\n\nNot a finding when a positive instruction accompanies the prohibition."
    },
    {
      "id": "log-no-priority",
      "code": "LOG007",
      "name": "Unstated priority",
      "family": "logical",
      "applies_to": [
        "core"
      ],
      "severity": "warning",
      "message": "Two constraints that can conflict at runtime with no tie-breaker.",
      "fix": "manual",
      "evidence": "LLM",
      "llm_exempt": false,
      "sniffers": [
        {
          "kind": "llm",
          "confidence": "medium",
          "hook_safe": false
        }
      ],
      "guidance": "Two constraints that will sometimes collide, with nothing saying which wins.\n\nBad:  Be thorough and finish within one paragraph.\nGood: Finish within one paragraph; drop detail before length.\n\nNot a finding when the constraints cannot conflict."
    },
    {
      "id": "log-no-success-criteria",
      "code": "LOG008",
      "name": "No success criteria",
      "family": "logical",
      "applies_to": [
        "core"
      ],
      "severity": "warning",
      "message": "A task with no statement of what a correct output looks like.",
      "fix": "manual",
      "evidence": "RE",
      "llm_exempt": false,
      "sniffers": [
        {
          "kind": "llm",
          "confidence": "medium",
          "hook_safe": false
        }
      ],
      "guidance": "A task with no definition of done. Any output is arguably compliant.\n\nBad:  Improve the onboarding docs.\nGood: Rewrite the onboarding docs so a new hire can deploy in under 30 minutes.\n\nNot a finding when success is defined elsewhere in scope."
    },
    {
      "id": "log-stale-directive",
      "code": "LOG009",
      "name": "Stale directive",
      "family": "logical",
      "applies_to": [
        "core"
      ],
      "severity": "warning",
      "message": "References a tool, file or step that no longer exists.",
      "fix": "manual",
      "evidence": "prac",
      "llm_exempt": false,
      "sniffers": [
        {
          "kind": "llm",
          "confidence": "medium",
          "hook_safe": false
        }
      ],
      "guidance": "An instruction pointing at something removed. Detecting it needs an inventory of current tools and files.\n\nBad:  Run `make lint` before committing, after `make lint` was deleted.\nGood: Run `npm run lint` before committing.\n\nNot a finding when the referenced item still exists."
    },
    {
      "id": "log-universal-quantifier",
      "code": "LOG010",
      "name": "Unenforceable universal",
      "family": "logical",
      "applies_to": [
        "core"
      ],
      "severity": "warning",
      "message": "always/never attached to something that cannot be guaranteed. In the spec pack this is an error.",
      "fix": "manual",
      "evidence": "ISO",
      "llm_exempt": false,
      "sniffers": [
        {
          "kind": "llm",
          "confidence": "medium",
          "hook_safe": false
        }
      ],
      "guidance": "A universal claim bound to something the reader cannot actually guarantee. The model checks enforceability.\n\nBad:  Always return within 10 ms.\nGood: Return within 10 ms for inputs under 1 KB.\n\nNot a finding when the universal is genuinely enforceable or bounded."
    },
    {
      "id": "log-unspecified-output",
      "code": "LOG011",
      "name": "Unspecified output contract",
      "family": "logical",
      "applies_to": [
        "core"
      ],
      "severity": "warning",
      "message": "No format, schema or length contract where a consumer expects one.",
      "fix": "manual",
      "evidence": "prac",
      "llm_exempt": false,
      "sniffers": [
        {
          "kind": "llm",
          "confidence": "medium",
          "hook_safe": false
        }
      ],
      "guidance": "No format, schema, or length given where downstream code will parse the output.\n\nBad:  Return the parsed users.\nGood: Return a JSON array of {id, email} objects.\n\nNot a finding when no consumer needs a fixed shape."
    },
    {
      "id": "prag-curse-of-knowledge",
      "code": "PRG001",
      "name": "Assumed context",
      "family": "pragmatic",
      "applies_to": [
        "core"
      ],
      "severity": "warning",
      "message": "The author's unstated background is load-bearing for the task.",
      "fix": "manual",
      "evidence": "RE",
      "llm_exempt": false,
      "sniffers": [
        {
          "kind": "llm",
          "confidence": "medium",
          "hook_safe": false
        }
      ],
      "guidance": "The task leans on background only the author holds. The reader cannot act on it.\n\nBad:  Fix it the way we discussed.\nGood: Fix the retry logic to back off exponentially.\n\nNot a finding when the shared context is written down."
    },
    {
      "id": "prag-persona-conflict",
      "code": "PRG002",
      "name": "Persona conflicts with task",
      "family": "pragmatic",
      "applies_to": [
        "core"
      ],
      "severity": "warning",
      "message": "An assigned persona that conflicts with the task.",
      "fix": "manual",
      "evidence": "prac",
      "llm_exempt": false,
      "sniffers": [
        {
          "kind": "llm",
          "confidence": "medium",
          "hook_safe": false
        }
      ],
      "guidance": "The assigned persona pulls against what the task needs.\n\nBad:  You are terse. Now write a full tutorial with worked examples.\nGood: Write a full tutorial with worked examples.\n\nNot a finding when persona and task agree."
    },
    {
      "id": "prag-register-mismatch",
      "code": "PRG003",
      "name": "Register mismatch",
      "family": "pragmatic",
      "applies_to": [
        "core"
      ],
      "severity": "warning",
      "message": "An instruction register implying an output register nobody asked for.",
      "fix": "manual",
      "evidence": "prac",
      "llm_exempt": false,
      "sniffers": [
        {
          "kind": "llm",
          "confidence": "medium",
          "hook_safe": false
        }
      ],
      "guidance": "The instruction's tone implies an output tone the author did not request.\n\nBad:  Casually, produce the formal compliance report.\nGood: Produce the formal compliance report.\n\nNot a finding when the register matches the output."
    },
    {
      "id": "prag-unstated-audience",
      "code": "PRG004",
      "name": "Unstated audience",
      "family": "pragmatic",
      "applies_to": [
        "core"
      ],
      "severity": "warning",
      "message": "Output quality depends on a reader profile the prompt never gives.",
      "fix": "manual",
      "evidence": "prac",
      "llm_exempt": false,
      "sniffers": [
        {
          "kind": "llm",
          "confidence": "medium",
          "hook_safe": false
        }
      ],
      "guidance": "The right output depends on who reads it, and the prompt never says.\n\nBad:  Explain how TLS works.\nGood: Explain how TLS works to a backend engineer new to cryptography.\n\nNot a finding when the audience is stated or does not matter."
    },
    {
      "id": "ref-attachment",
      "code": "REF001",
      "name": "Attachment ambiguity",
      "family": "referential",
      "applies_to": [
        "core"
      ],
      "severity": "warning",
      "message": "A modifier attachable to two heads.",
      "fix": "manual",
      "evidence": "RE",
      "llm_exempt": false,
      "sniffers": [
        {
          "kind": "llm",
          "confidence": "medium",
          "hook_safe": false
        }
      ],
      "guidance": "A prepositional or relative clause that can attach to two heads, including garden-path readings.\n\nBad:  Log the request from the client that failed.\nGood: Log the request that failed; it came from the client.\n\nNot a finding when only one attachment is grammatically possible."
    },
    {
      "id": "ref-incomplete",
      "code": "REF002",
      "name": "Incomplete reference",
      "family": "referential",
      "applies_to": [
        "core"
      ],
      "severity": "warning",
      "message": "A reference with no resolvable target.",
      "fix": "manual",
      "evidence": "RE",
      "llm_exempt": false,
      "sniffers": [
        {
          "kind": "vale",
          "pattern": "\\b(the (section|table|figure|file|diagram|list|steps?) (above|below)|as (previously|described above|mentioned above)|see (above|below)|the attached|the aforementioned)\\b",
          "confidence": "medium",
          "hook_safe": false
        },
        {
          "kind": "llm",
          "confidence": "medium",
          "hook_safe": false
        }
      ],
      "guidance": "A pointer to something the reader cannot resolve. The pattern triggers; the model checks whether the target is actually findable.\n\nBad:  Follow the steps in the section above.\nGood: Follow the steps in section 3.2 of this file.\n\nNot a finding when the target is numbered or named unambiguously."
    },
    {
      "id": "ref-missing-actor",
      "code": "REF003",
      "name": "Missing trigger or actor",
      "family": "referential",
      "applies_to": [
        "core"
      ],
      "severity": "warning",
      "message": "An instruction with no stated agent or trigger. In the spec pack this is an error.",
      "fix": "manual",
      "evidence": "RE",
      "llm_exempt": false,
      "sniffers": [
        {
          "kind": "llm",
          "confidence": "medium",
          "hook_safe": false
        }
      ],
      "guidance": "A requirement with no agent, no condition, or neither. EARS templates exist to force both.\n\nBad:  The cache is cleared on startup.\nGood: The boot script clears the cache on startup.\n\nNot a finding when the actor and trigger are unambiguous in the surrounding section."
    },
    {
      "id": "ref-passive-actor",
      "code": "REF004",
      "name": "Actor-eliding passive",
      "family": "referential",
      "applies_to": [
        "core"
      ],
      "severity": "warning",
      "message": "Passive voice that drops the actor.",
      "fix": "manual",
      "evidence": "RE",
      "llm_exempt": false,
      "sniffers": [
        {
          "kind": "llm",
          "confidence": "medium",
          "hook_safe": false
        }
      ],
      "guidance": "Passive that omits who acts. Passive alone is fine; passive with no agent leaves the doer unspecified. The model confirms the actor is missing.\n\nBad:  The output should be validated.\nGood: The CI job validates the output.\n\nNot a finding when the actor is named (\"validated by the gateway\") or obvious in context."
    },
    {
      "id": "ref-scope-ambiguity",
      "code": "REF005",
      "name": "Coordination scope ambiguity",
      "family": "referential",
      "applies_to": [
        "core"
      ],
      "severity": "warning",
      "message": "Modifier attachment across and/or is undecidable.",
      "fix": "manual",
      "evidence": "RE",
      "llm_exempt": false,
      "sniffers": [
        {
          "kind": "vale",
          "pattern": "\\b(and|or) [a-z]+ (and|or) [a-z]+\\b",
          "confidence": "medium",
          "hook_safe": false
        },
        {
          "kind": "llm",
          "confidence": "medium",
          "hook_safe": false
        }
      ],
      "guidance": "A chain of and/or where a modifier could bind to one term or all of them. The model checks whether the grouping is actually ambiguous.\n\nBad:  Delete files that are old and unused or temporary.\nGood: Delete files older than 30 days.\n\nNot a finding when parentheses or wording fix the grouping."
    },
    {
      "id": "ref-vague-pronoun",
      "code": "REF006",
      "name": "Vague pronoun",
      "family": "referential",
      "applies_to": [
        "core"
      ],
      "severity": "warning",
      "message": "Sentence-initial pronoun with an ambiguous or distant antecedent.",
      "fix": "arg",
      "evidence": "RE",
      "llm_exempt": false,
      "sniffers": [
        {
          "kind": "vale",
          "pattern": "(^|[.!?]\"?[[:space:]]+)(This|That|It|These|Those)[[:space:]]+(is|are|was|were|will|would|should|shall|can|could|may|might|means|makes|does|did|has|have|gives|breaks|causes|requires|needs|allows|refers|happens|leads)\\b",
          "confidence": "medium",
          "hook_safe": false
        },
        {
          "kind": "llm",
          "confidence": "medium",
          "hook_safe": false
        }
      ],
      "guidance": "A sentence-initial bare demonstrative used as a pronoun (\"This is...\", \"It should...\") whose\nantecedent is ambiguous or distant. The reader, and a model, must guess which of several prior\nnouns the pronoun points at.\n\nThe pattern is a trigger only: it finds sentence-initial `This/That/It/These/Those` followed by a\nverb, which marks pronoun use rather than a determiner (\"This value\" does not fire). The model then\nadjudicates whether the antecedent is actually ambiguous.\n\nBad:  The parser reads the config and the loader reads the manifest. This is then cached.\nGood: The parser reads the config and the loader reads the manifest. The parsed config is cached.\n\nNot a finding when exactly one antecedent is in scope, when the demonstrator is a determiner (\"This\nfunction returns...\"), or inside a quoted example or code block."
    },
    {
      "id": "str-buried-instruction",
      "code": "STR001",
      "name": "Buried instruction",
      "family": "structural",
      "applies_to": [
        "prompt"
      ],
      "severity": "warning",
      "message": "A critical directive placed mid-document in a long prompt.",
      "fix": "manual",
      "evidence": "LLM",
      "llm_exempt": false,
      "sniffers": [
        {
          "kind": "llm",
          "confidence": "medium",
          "hook_safe": false
        }
      ],
      "guidance": "A must-follow rule sits in the middle of a long prompt, where retrieval is measurably worse than at either end.\n\nBad:  A long prompt with the only redaction rule stated in the middle of page two.\nGood: The redaction rule stated in the opening constraints block.\n\nNot a finding when the prompt is short or the directive sits at either end."
    },
    {
      "id": "str-example-contradicts-rule",
      "code": "STR002",
      "name": "Example contradicts instruction",
      "family": "structural",
      "applies_to": [
        "prompt"
      ],
      "severity": "warning",
      "message": "A few-shot example that violates a stated rule; the example wins.",
      "fix": "manual",
      "evidence": "prac",
      "llm_exempt": false,
      "sniffers": [
        {
          "kind": "llm",
          "confidence": "medium",
          "hook_safe": false
        }
      ],
      "guidance": "An example breaks a rule the prompt states. The example usually wins over the rule.\n\nBad:  Rule: never use contractions. Example answer: don't do that.\nGood: Rule: never use contractions. Example answer: do not do that.\n\nNot a finding when every example obeys the rule."
    },
    {
      "id": "str-example-label-imbalance",
      "code": "STR003",
      "name": "Few-shot label imbalance",
      "family": "structural",
      "applies_to": [
        "prompt"
      ],
      "severity": "warning",
      "message": "A skewed label distribution across few-shot examples; majority-label bias.",
      "fix": "manual",
      "evidence": "LLM",
      "llm_exempt": false,
      "sniffers": [
        {
          "kind": "llm",
          "confidence": "medium",
          "hook_safe": false
        }
      ],
      "guidance": "Few-shot examples skew toward one label, biasing the model toward the majority.\n\nBad:  Nine positive examples and one negative.\nGood: Five positive and five negative.\n\nNot a finding when the true prior is genuinely skewed."
    },
    {
      "id": "str-example-recency",
      "code": "STR004",
      "name": "Few-shot label ordering",
      "family": "structural",
      "applies_to": [
        "prompt"
      ],
      "severity": "warning",
      "message": "Examples ordered so the last label dominates.",
      "fix": "auto",
      "evidence": "LLM",
      "llm_exempt": false,
      "sniffers": [
        {
          "kind": "llm",
          "confidence": "medium",
          "hook_safe": false
        }
      ],
      "guidance": "Predictions skew toward the label seen near the end of the prompt.\n\nBad:  Examples ordered pos, pos, neg, neg, neg with all negatives last.\nGood: Examples with interleaved or shuffled labels.\n\nNot a finding when order carries meaning."
    },
    {
      "id": "str-format-leakage",
      "code": "STR005",
      "name": "Format leakage",
      "family": "structural",
      "applies_to": [
        "prompt"
      ],
      "severity": "warning",
      "message": "Incidental style in examples inferred as a rule.",
      "fix": "manual",
      "evidence": "prac",
      "llm_exempt": false,
      "sniffers": [
        {
          "kind": "llm",
          "confidence": "medium",
          "hook_safe": false
        }
      ],
      "guidance": "Incidental style in examples (length, punctuation, hedging) gets read as a requirement.\n\nBad:  Every example answer is one word, though length is not part of the task.\nGood: Examples vary in length so no length rule is implied.\n\nNot a finding when the shared style is the intended contract."
    },
    {
      "id": "str-inconsistent-delimiters",
      "code": "STR006",
      "name": "Inconsistent formatting scheme",
      "family": "structural",
      "applies_to": [
        "prompt"
      ],
      "severity": "warning",
      "message": "Mixed separator and heading conventions within one prompt.",
      "fix": "auto",
      "evidence": "LLM",
      "llm_exempt": false,
      "sniffers": [
        {
          "kind": "llm",
          "confidence": "medium",
          "hook_safe": false
        }
      ],
      "guidance": "Heading and separator styles change within one prompt. Meaning-preserving format shifts move few-shot accuracy.\n\nBad:  ## Step 1, then **Step 2:**, then STEP 3 -.\nGood: ## Step 1, ## Step 2, ## Step 3.\n\nNot a finding when one scheme is used throughout."
    },
    {
      "id": "str-instruction-data-mixing",
      "code": "STR007",
      "name": "Undelimited data",
      "family": "structural",
      "applies_to": [
        "prompt"
      ],
      "severity": "warning",
      "message": "Pasted content not fenced off from instructions; injection surface.",
      "fix": "auto",
      "evidence": "LLM",
      "llm_exempt": false,
      "sniffers": [
        {
          "kind": "llm",
          "confidence": "medium",
          "hook_safe": false
        }
      ],
      "guidance": "Pasted data runs straight into instructions, so the reader cannot tell directive from content, and injected text can pose as a directive.\n\nBad:  Summarise this: the pasted text also says to ignore prior instructions.\nGood: Summarise the text inside the <data> tags below.\n\nNot a finding when the data is clearly delimited."
    },
    {
      "id": "str-irrelevant-context",
      "code": "STR008",
      "name": "Irrelevant context",
      "family": "structural",
      "applies_to": [
        "prompt"
      ],
      "severity": "warning",
      "message": "Background that does not bear on the task; distracts the model.",
      "fix": "manual",
      "evidence": "LLM",
      "llm_exempt": false,
      "sniffers": [
        {
          "kind": "llm",
          "confidence": "medium",
          "hook_safe": false
        }
      ],
      "guidance": "Background with no effect on the task. Models are measurably distracted by irrelevant context.\n\nBad:  Our company was founded in 1998. Parse this date string.\nGood: Parse this date string: 2026-09-09.\n\nNot a finding when the context constrains the task."
    },
    {
      "id": "str-premise-order",
      "code": "STR009",
      "name": "Premise order mismatch",
      "family": "structural",
      "applies_to": [
        "prompt"
      ],
      "severity": "warning",
      "message": "Facts ordered against the required reasoning chain.",
      "fix": "manual",
      "evidence": "LLM",
      "llm_exempt": false,
      "sniffers": [
        {
          "kind": "llm",
          "confidence": "medium",
          "hook_safe": false
        }
      ],
      "guidance": "Facts appear in an order that fights the reasoning chain. Reordering premises alone drops reasoning accuracy.\n\nBad:  The conclusion first, then its three supporting facts out of order.\nGood: The facts in dependency order, conclusion last.\n\nNot a finding when order does not affect the chain."
    }
  ]
};
