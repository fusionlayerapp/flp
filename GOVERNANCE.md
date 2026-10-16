# Governance

## Project steward

FLP is stewarded by the FusionLayer core team (GitHub: [fusionlayerapp](https://github.com/fusionlayerapp)). The steward is responsible for the long-term direction of the spec, schema releases, and tooling decisions.

## Decision making

Day-to-day decisions are made by rough consensus among active maintainers. Disagreements are resolved by the project steward.

Major changes — including new primitive kinds, breaking schema changes, and tooling architecture shifts — require an Architecture Decision Record (ADR) filed in `docs/`. An ADR is considered accepted when it has been open for at least 7 days with no unresolved objections from maintainers.

## Maintainers

Currently maintained by the FusionLayer core maintainers. Community maintainers are welcome after a contributor has made 5 or more accepted external contributions (PRs merged to `main`). To request maintainer access, open an issue with the `kind/meta` label.

Maintainers are expected to:

- Review PRs within 7 days
- Follow and enforce the [Code of Conduct](CODE_OF_CONDUCT.md)
- Participate in ADR discussions when tagged

## Adding a new primitive kind

Adding a `kind` to the FLP spec is a significant change. It requires:

1. An ADR in `docs/` describing the kind, its schema, and its relationship to existing kinds
2. A working implementation in the FusionLayer reference engine
3. At least 2 reference primitives in `examples/`, MIT-licensed
4. Acceptance by maintainer consensus (7-day ADR window)

Proposed kinds that do not have a reference engine implementation will not be accepted.

## Breaking changes

FLP follows [Semantic Versioning](https://semver.org/). A breaking change is any modification that causes a previously valid primitive file to fail validation under the new schema.

- Breaking changes require a major version bump
- A minimum 90-day deprecation window is required before removing any field or changing a field's type in an existing schema
- Deprecations are announced in `CHANGELOG.md` and in the relevant schema file

## 5. Intellectual Property & Licensing

- Specification text (`spec/*`, `docs/*`, `README.md`, `GOVERNANCE.md`, `CHANGELOG.md`, `CONTRIBUTING.md`, `SECURITY.md`) is licensed under Creative Commons Attribution 4.0 International (**CC BY 4.0**).
- JSON Schemas (`schemas/*.json`), reference primitives (`examples/*`), and validation tooling (`tools/*`) are licensed under the **MIT License**.
- See [`LICENSE`](LICENSE) and [`NOTICE`](NOTICE) for full text.
- Contributors certify that they have the right to contribute under these licenses ([Developer Certificate of Origin](https://developercertificate.org)).
- The steward and contributors make **no patent claims** against conforming implementations of FLP.

## Security

Security issues are handled separately. See [SECURITY.md](SECURITY.md).
