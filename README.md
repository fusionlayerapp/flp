# FusionLayer Primitives (FLP)

> **Status:** pre-1.0 draft. Spec authored inside [hn2/fusionlayer](https://github.com/hn2/fusionlayer); this repo is the public-flip target.

FLP is an open file-format family for declaring user-authored AI orchestration primitives. The same primitive file works across any FLP-compliant runtime; FusionLayer is the reference implementation.

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

## Repo scope (planned at flip)

- JSON Schema for each kind
- Reference linter (`flp-lint` CLI)
- Signature format spec (Ed25519, detached)
- 1–2 reference primitives per kind, MIT-licensed
- Optional `INDEX.json` for federated community catalog

**Out of scope:** marketplace backend, install logic, ratings, paid templates, telemetry — these stay in the FusionLayer engine.

## Standardization roadmap

See [ROADMAP.md](ROADMAP.md).

## Related

- [hn2/uacp](https://github.com/hn2/uacp) — Unified AI Context Protocol
- [hn2/adapter-protocol](https://github.com/hn2/adapter-protocol) — AI Adapter Protocol

## License

Apache 2.0 (spec) + MIT (reference primitives), planned for public flip.
