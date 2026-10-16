# Contributing to FLP

## Ways to contribute

- **Bug reports** — Open a GitHub issue with the `bug` label. Include the schema version, the primitive file, and the `flp-lint` output.
- **Primitive examples** — Open a PR adding a new primitive under `examples/<kind>/`. See existing examples for structure. All examples must pass `flp-lint` and carry an MIT license header.
- **Schema proposals** — Open an issue with the `schema` label before writing a PR. Breaking schema changes require an ADR; additive changes require at least 7 days open for review.
- **Tooling improvements** — PRs against `tools/flp-lint/` welcome. Include tests.

## Standards

- Every primitive file must pass `flp-lint validate <file>` before merging.
- Every example must include a `README.md` explaining what the primitive does, when to use it, and 1–2 example invocations.
- MIT license header required on all primitive files and example READMEs.
- No vendor-specific primitives in the reference gallery (keep it transport-neutral).

## Schema versioning policy

- **v1.x** — additive only. New tables, new optional fields, new enum values with default. Old importers ignore unknown fields.
- **v2.0.0** — breaking changes. Requires a migration shim and a 30-day notice period.

## PR process

1. Fork and create a branch from `main`.
2. Run `flp-lint validate` on changed files.
3. Open PR — description should explain the use case, not just the change.
4. Wait for at least one maintainer review.
5. The maintainer merges using squash.

## Code of Conduct

See [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).
