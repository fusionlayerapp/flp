# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - 2026-05-31

### Added
- JSON Schema definitions for all 9 primitive kinds: `policy`, `guideline`, `intent`, `strategy`, `behavior`, `playbook`, `routine`, `template`, `pack`
- `flp-lint` CLI v1.0.0 — validates primitive YAML files against their kind schemas, reports structured errors
- 16 reference primitives in `examples/` covering each primitive kind, MIT-licensed
- Signature format specification in `docs/signing.md` — Ed25519 detached signatures over SHA-256 of primitive YAML bytes
- `pack` kind schema supporting versioned bundles of multiple primitives with dependency declarations
- `INDEX.json` schema for federated community catalog discovery

[Unreleased]: https://github.com/fusionlayerapp/flp/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/fusionlayerapp/flp/releases/tag/v1.0.0
