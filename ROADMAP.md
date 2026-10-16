# FLP Standardization Roadmap

This document explains the path from FLP being a private FusionLayer concern to becoming a recognized open standard for AI orchestration primitives.

## Status

- **Today:** v0.x draft, used only by FusionLayer engine, repo private
- **Target:** v1.0 public spec at first flip (planned 2026-05-31), v1.1+ community-driven

## Vision

A common file format for AI orchestration primitives — rules, policies, guidelines, intents, strategies, behaviors, playbooks, routines, templates, packs — that runs across vendors. Define once in FLP, execute on Claude / GPT / Gemini / local / federated, no rewrites.

The same problem MCP solved for tool-calling, FLP solves for primitives.

## Probability ranges

| Outcome | 18 months | 3 years |
|---------|-----------|---------|
| THE singular standard | <5% | 10–15% |
| One of 2–3 recognized standards | 20–30% | 35–45% |
| Recognized in a niche (5–10 adopter tools) | 40–50% | 55–65% |
| Used only by FusionLayer | 25–35% | 15–25% |

Most likely outcome: recognized in a niche. That's enough.

## 4 paths to standardization

### Path A — "Be Cursor's Helm" (best odds)
One major adopter beyond FusionLayer. Targets: Cursor, Continue, Cline, Aider, Replit. Strategy: ship importers, manifesto blog post, founder outreach.

### Path B — "Anthropic blesses it"
Anthropic adopts FLP for Skills v2. Low probability (5–10%) but high payoff.

### Path C — "Enterprise procurement"
Enterprises mandate FLP-compatibility to avoid lock-in. Slow burn, 3–5 years.

### Path D — "Quiet de facto" (most likely)
Used by enough small tools that adoption is assumed. Open-VSX vs MS Marketplace pattern.

## Migration paths (the wedge)

| From | Maps to FLP |
|------|-------------|
| Claude `SKILL.md` | Behavior + Intent + sources |
| ChatGPT Custom GPT | Behavior + Playbook + Strategy |
| Cursor `.cursorrules` | Guideline |
| Continue `config.json` | Strategy + Behavior |
| Aider config | Behavior + Guideline |
| Replit AI config | Behavior + Strategy |

Bidirectional (FLP → vendor format) reverse exporters also planned. Portability both ways = the actual standard claim.

## Phases

| Phase | Window | Milestones |
|-------|--------|------------|
| 0 — pre-flip | now → 2026-05-31 | v1.0 schemas frozen, linter shipped, reference primitives, signature spec |
| 1 — public flip | 2026-05-31 | Repo public, npm published, manifesto, outreach |
| 2 — first external adopter | 2026 Q3-Q4 | One non-FL tool adopts, gallery, conformance draft |
| 3 — institutional cover | 2027 Q1-Q2 | LF AI submission, steering committee, v1.1 |
| 4 — recognized standard | 2027 Q3+ | 10+ tools, enterprise demand, v2.0 governance |

## Won't do

- Lock primitives to FusionLayer (vendor-portable always)
- Use FLP to upsell FL (spec stays neutral)
- Trade portability for features
- Move marketplace into spec repo (federated catalog index optional)

## Success metrics

| Metric | 6mo | 18mo | 3yr |
|--------|-----|------|-----|
| GitHub stars | 100 | 500 | 2,000 |
| External adopters | 1 | 5 | 15 |
| Reference primitives | 30 | 100 | 500 |
| Production deployments | 10 | 100 | 5,000 |
| Conformance-certified runtimes | 0 | 2 | 8 |

## Comparable cases

**Made it:** Markdown (no foundation, GitHub adopted), Helm (CNCF + k8s), OpenAPI (consortium), JSON Schema (community-driven), MCP (Anthropic backing).

**Didn't:** dozens of "AI agent protocols" 2023–2025, LangChain Hub format, multiple prompt-template specs.

**Pattern:** real pain → one major adopter → foundation/neutrality → 12–24mo growth → critical mass. FLP is at step 1.

## License

Apache 2.0.
