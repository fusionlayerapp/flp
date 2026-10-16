# be-concise

**What:** Instructs the model to respond directly and briefly, stripping filler phrases and affirmations.

**When to use:** Productivity tools, developer assistants, or any context where users want answers without conversational padding. Pair with `use-markdown-headings` for structured but tight output.

**Example:**

Input: `"What does Array.prototype.flat() do?"`

Without guideline: "Great question! Certainly, I'd be happy to explain. `Array.prototype.flat()` is a JavaScript method that..."

With guideline: "`Array.prototype.flat()` creates a new array with all sub-array elements concatenated up to a specified depth (default 1)."
