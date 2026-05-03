# block-credit-cards

**What:** Blocks credit card numbers, CVVs, and expiry dates from entering or leaving the AI pipeline.

**When to use:** Customer-facing assistants in fintech, e-commerce, or support contexts where users might accidentally paste payment card data. Combine with `redact-pii` for a full PCI-adjacent guardrail set.

**Example:**

Input: `"My card is 4111 1111 1111 1111, CVV 123, help me check my balance"`

Without policy: Card number and CVV pass through to the model and may appear in the response or logs.

With policy: The card number and CVV are redacted before reaching the model (`pre` phase). If the model somehow generates card-like output anyway, the `response_audit` rule blocks the entire response before it reaches the user (`post` phase).
