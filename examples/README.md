# FLP Examples — Reference Primitives Gallery

A curated collection of reference primitives for the FusionLayer Protocol (FLP). Each example is production-ready and can be used as-is or as a starting point for your own primitives.

## Policies (`.flp.yml`)

Enforce rules on inputs and/or outputs at the pipeline level.

| Primitive | Description |
|-----------|-------------|
| [redact-pii](./policies/redact-pii/) | Redacts names, emails, phones, addresses, and SSNs from all inputs and outputs |
| [block-credit-cards](./policies/block-credit-cards/) | Blocks payment card numbers and CVVs from entering or leaving the pipeline |

## Guidelines (`.flg.yml`)

Shape the model's tone, style, and behavior.

| Primitive | Description |
|-----------|-------------|
| [be-concise](./guidelines/be-concise/) | Strips filler phrases and forces direct, brief answers |
| [use-markdown-headings](./guidelines/use-markdown-headings/) | Enforces consistent heading, list, and code block structure in responses |

## Intents (`.fli.yml`)

Trigger specialized prompts based on what the user is trying to do.

| Primitive | Description |
|-----------|-------------|
| [code-review](./intents/code-review/) | Activates a structured code review (bugs, security, perf, style) on review-related phrases |
| [meeting-summary](./intents/meeting-summary/) | Produces decisions, action items, and open questions from a meeting transcript |

## Strategies (`.fln.yml`)

Control how requests are routed through model pipelines.

| Primitive | Description |
|-----------|-------------|
| [cheap-then-strong](./strategies/cheap-then-strong/) | Drafts with a fast cheap model, polishes with a stronger one |
| [always-claude-for-code](./strategies/always-claude-for-code/) | Routes code requests to Claude Sonnet, general questions to a cheaper model |

## Behaviors (`.flb.yml`)

Full persona definitions — tone, voice, and identity.

| Primitive | Description |
|-----------|-------------|
| [friendly-senior-engineer](./behaviors/friendly-senior-engineer/) | Warm, direct senior engineer who explains the "why" and gives honest feedback |
| [formal-academic](./behaviors/formal-academic/) | Rigorous scholarly voice with careful qualification of claims |

## Playbooks (`.flpb.yml`)

Multi-step strategy graphs for complex tasks.

| Primitive | Description |
|-----------|-------------|
| [outline-draft-critique-polish](./playbooks/outline-draft-critique-polish/) | Four-stage writing pipeline: outline → draft → self-critique → polished final |
| [research-cite-synthesize](./playbooks/research-cite-synthesize/) | Decomposes a research question, researches sub-questions in parallel, synthesizes |

## Routines (`.flr.yml`)

Scheduled, automated prompts with optional inputs and delivery.

| Primitive | Description |
|-----------|-------------|
| [weekly-standup-summary](./routines/weekly-standup-summary/) | Every Monday 8am UTC, generates a standup summary from memory and emails it |

## Templates (`.flt.yml`)

UI layout and visual density presets.

| Primitive | Description |
|-----------|-------------|
| [minimal-command](./templates/minimal-command/) | Keyboard-first layout with hidden sidebar and command palette as home view |
| [reading-mode](./templates/reading-mode/) | Larger text, narrow content column, generous spacing for long-form reading |

## Packs (`.flpk.yml`)

Bundles of primitives installed together.

| Primitive | Description |
|-----------|-------------|
| [code-review-pack](./packs/code-review-pack/) | Bundles code-review intent + cheap-then-strong strategy + concise + markdown guidelines |

---

## File extensions reference

| Type | Extension | Schema `kind` |
|------|-----------|---------------|
| Policy | `.flp.yml` | `policy` |
| Guideline | `.flg.yml` | `guideline` |
| Intent | `.fli.yml` | `intent` |
| Strategy | `.fln.yml` | `strategy` |
| Behavior | `.flb.yml` | `guideline` (with persona shape) |
| Playbook | `.flpb.yml` | `strategy` (multi-step graph) |
| Routine | `.flr.yml` | `routine` |
| Template | `.flt.yml` | `template` (separate format) |
| Pack | `.flpk.yml` | `pack` (bundle) |

## License

MIT License — Copyright 2026 FusionLayer Contributors
