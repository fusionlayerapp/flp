# redact-pii

**What:** Automatically redacts personally identifiable information from all inputs and outputs.

**When to use:** Any assistant handling user data, support tickets, or documents that may contain names, emails, phone numbers, addresses, or SSNs. Apply at the org or workspace level to enforce compliance without relying on individual users to sanitize data.

**Example:**

Input: `"Please help me email John Smith at john@example.com about his order"`

Without policy: The model echoes the name and email freely throughout its response.

With policy: `[NAME]` and `[EMAIL]` are substituted before the prompt reaches the model and before the response leaves the engine. The model never sees or repeats the raw PII.
