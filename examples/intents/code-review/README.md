# code-review

**What:** Activates a structured code review prompt when the user asks to review or check code.

**When to use:** Developer assistants and coding tools where you want consistent, thorough reviews rather than ad-hoc feedback. The intent fires automatically when review-related phrases are detected — no need to craft a specific prompt.

**Example:**

Input: `"Can you check my code?"` (followed by a Python function)

Without intent: Model gives a generic, surface-level response that may or may not cover security or edge cases.

With intent: The intent fires on "check my code", injecting the structured review prompt. The model systematically evaluates bugs, security, performance, style, and edge cases — providing actionable findings for each category.
