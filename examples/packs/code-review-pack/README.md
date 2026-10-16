# code-review-pack

**What:** A bundle of four primitives that together configure an assistant for structured, cost-efficient code reviews with clean output.

**When to use:** Install this pack on any coding or developer assistant to get consistent code review behavior out of the box. Instead of configuring each primitive individually, one pack reference wires them all together.

**What's included:**

| Primitive | Role |
|-----------|------|
| `@fl/code-review` (intent) | Fires on review-related phrases and injects the structured review prompt |
| `@fl/cheap-then-strong` (strategy) | Drafts with Haiku, polishes with Sonnet to keep costs down |
| `@fl/be-concise` (guideline) | Keeps responses direct — no filler, just findings |
| `@fl/use-markdown-headings` (guideline) | Structures output with headers and code blocks for easy scanning |

**Example:**

Input: `"Check this function"` + code

Without pack: Inconsistent responses depending on the base model and no guaranteed structure.

With pack: The intent fires, the strategy routes through a cost-efficient two-model pipeline, and the output is a well-structured Markdown review with sections for bugs, security, performance, and style — direct and scannable.
