# FusionLayer Primitives (FLP)

> **Status:** pre-1.0 draft. Spec authored inside [hn2/fusionlayer](https://github.com/hn2/fusionlayer); this repo is the public-flip target.

FLP is an open file-format family for declaring user-authored AI orchestration primitives. The same primitive file works across any FLP-compliant runtime; FusionLayer is the reference implementation.

## Problem

Every AI product that lets a user customize behavior — enforce a PII policy, set a house tone, route cheap requests to a cheap model, schedule a recurring digest — invents its own bespoke, engine-specific config format for it, so the customization cannot move with the user to another tool and cannot be shared, reviewed or version-controlled like code. FLP defines one file-format family for these primitives (policy, guideline, intent, strategy, behavior, playbook, routine, template, pack) with a JSON Schema per kind, so a user-authored `.flp.yml`/`.flb.yml`/etc. file is portable across any FLP-compliant runtime instead of being locked into one engine's proprietary settings screen.

## Primitive kinds

| Kind | File ext | Purpose |
|------|----------|---------|
| Policy | `.flp.yml` | Hard enforcement (PII, cost caps, denylists) |
| Guideline | `.flg.yml` | Soft preference appended to system prompt |
| Intent | `.fli.yml` | Task class declaration |
| Strategy | `.fln.yml` | Routing logic (which model, which mode) |
| Behavior | `.flb.yml` | Persona identity (tone, voice, style bundle) |
| Playbook | `.flpb.yml` | Multi-step workflow / chain |
| Routine | `.flr.yml` | Cron-scheduled task |
| Template | `.flt.yml` | UI/UX preset |
| Pack | `.flpk.yml` | Bundle of multiple primitives, versioned together |

## What's here now

- JSON Schema for every kind — [`schema/`](schema/)
- Reference linter — [`tools/flp-lint`](tools/flp-lint) (the `flp-lint` CLI)
- Signature format spec (Ed25519, detached) — [`docs/signing.md`](docs/signing.md)
- 1–2 reference primitives per kind — [`examples/`](examples/)

**Still planned:** an optional `INDEX.json` for a federated community catalog.

**Out of scope:** marketplace backend, install logic, ratings, paid templates, telemetry — these stay in the FusionLayer engine.

## Worked example

[`examples/policies/redact-pii/policy.flp.yml`](examples/policies/redact-pii/policy.flp.yml) is a Policy primitive that redacts PII before it reaches the model and before a response leaves the engine:

```yaml
meta:
  uacp: "1.0.0"
  kind: policy
  id: "@fl/redact-pii"
  version: "1.0.0"
  author: "FusionLayer Contributors"

enforce: both

rules:
  - type: pii_block
    action: redact
    params:
      categories: [name, email, phone, address, ssn]
```

`enforce: both` runs the rule pre-generation (scrubbing the prompt) and post-generation (scrubbing the response). Given the input `"Please help me email John Smith at john@example.com about his order"`, a runtime enforcing this policy substitutes `[NAME]` and `[EMAIL]` before the model ever sees the raw text, and the model never repeats it in its reply. The schema for this kind is [`schema/policy.json`](schema/policy.json); every other rule `type` it accepts (`secret_block`, `budget_cap`, `vendor_allowlist`, `export_block`, `banned_topics`, `response_audit`, `compliance_region`) is enumerated there.

## How to implement

1. Pick the primitive kind for what you're declaring (table above) and write a `.fl*.yml` file against its schema in [`schema/`](schema/) — use the matching example in [`examples/`](examples/) as a starting point.
2. Lint it: `node tools/flp-lint/bin/flp-lint.js my-policy.flp.yml` (exit code 0 = valid; add `--json` for machine-readable output).
3. Ship the file with your project or submit it to a marketplace. Marketplace-distributed primitives should carry an Ed25519 detached signature — see [`docs/signing.md`](docs/signing.md) for the signing and verification steps.
4. Any FLP-compliant runtime (FusionLayer today) reads the same file — no engine-specific rewrite needed.

## Standardization roadmap

See [ROADMAP.md](ROADMAP.md).

## Related

- [hn2/uacp](https://github.com/hn2/uacp) — Unified AI Context Protocol
- [hn2/adapter-protocol](https://github.com/hn2/adapter-protocol) — AI Adapter Protocol

## License

Apache 2.0 (spec) + MIT (reference primitives), planned for public flip.
