# cheap-then-strong

**What:** Generates a fast draft with a lightweight model, then refines it with a stronger model — balancing cost and quality.

**When to use:** General-purpose assistants where most responses are good enough from a small model, but polish matters. Reduces cost by 60-80% versus sending everything to the strong model, while retaining quality for the final output.

**Example:**

Input: `"Write a professional email declining a vendor proposal"`

Without strategy: Always routes to the strong model at full cost.

With strategy: Haiku generates the draft email in ~200ms. Sonnet reviews and polishes tone, structure, and word choice. If the total cost would exceed 2 cents, the engine falls back to Haiku-only output.
