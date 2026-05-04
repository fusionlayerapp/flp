# Security Policy

## Scope

FLP is a spec + schema repository. Security concerns relevant here:

- **Schema injection** — a malicious primitive file that, when consumed by a runtime, causes unintended behaviour.
- **Validator bypass** — a primitive that passes `flp-lint` but violates the schema semantics in a way that could harm a consuming engine.
- **Tooling vulnerabilities** — bugs in `flp-lint` that could cause code execution or resource exhaustion when processing untrusted files.

## Reporting

Report security issues privately via GitHub Security Advisories (preferred) or by emailing the project steward. Do **not** open a public GitHub issue for security vulnerabilities.

We aim to acknowledge reports within 3 business days and resolve within 30 days.

## Supported versions

Only the latest published version of the FLP schema and `flp-lint` CLI is actively maintained.

## Notes for runtime implementors

- Never `eval` or execute content from primitive `body` or `rules` fields without sanitisation.
- `budget_cap` and `vendor_allowlist` rule types should be validated server-side; do not trust client-supplied limits.
- Always validate incoming primitives against the published JSON Schema before applying them to a pipeline.
