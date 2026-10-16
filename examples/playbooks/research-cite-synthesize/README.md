# research-cite-synthesize

**What:** Decomposes a research question into sub-questions, researches each in parallel, then synthesizes a comprehensive cited answer.

**When to use:** Deep research tasks where a single model call produces shallow or one-sided answers. The parallel research step explores multiple angles simultaneously, and the synthesis step produces a more complete picture than sequential research.

**Example:**

Input: `"What are the trade-offs between microservices and monolithic architectures?"`

Without playbook: A generic overview hitting the obvious points — scalability, deployment complexity, team size.

With playbook:
1. `decompose` breaks it into: operational complexity, performance characteristics, team/org scaling, failure isolation, and migration paths
2. `research` fans out to answer each sub-question independently and in parallel
3. `synthesize` merges the five answers into a nuanced response that covers edge cases (e.g., "microservices only pay off at a certain team size"), resolves contradictions, and provides a consolidated source list
