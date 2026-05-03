# always-claude-for-code

**What:** Routes code-related requests to Claude Sonnet and general questions to a cheaper model, using a classification step to decide.

**When to use:** Multi-purpose assistants that handle both technical and non-technical queries. Keeps costs low for simple Q&A while ensuring code generation and debugging always use the strongest available model.

**Example:**

Input: `"Fix this TypeScript error: Property 'x' does not exist on type 'Y'"`

Without strategy: Routes to whatever the default model is, which may not be optimal for code.

With strategy: The `route` node classifies this as "code", so it goes to Claude Sonnet. A follow-up like `"What's the capital of France?"` gets classified as "general" and routes to GPT-4o-mini at a fraction of the cost.
