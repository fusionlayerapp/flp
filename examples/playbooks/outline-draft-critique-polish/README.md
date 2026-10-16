# outline-draft-critique-polish

**What:** A four-stage writing playbook that outlines, drafts, self-critiques, and produces a polished final version.

**When to use:** Long-form writing tasks — blog posts, reports, proposals, essays — where a single-pass draft isn't good enough. The self-critique stage catches weak arguments and unclear passages that a single generate call misses.

**Example:**

Input: `"Write a 600-word post arguing that remote work increases developer productivity"`

Without playbook: A single-pass draft that may be well-written but contains unchallenged assumptions and weak transitions.

With playbook:
1. `outline` node creates a skeleton (intro, 3 supporting arguments, counterargument, conclusion)
2. `draft` node writes the full post following the outline
3. `critique` node identifies: "Argument 2 lacks supporting data", "Counterargument section feels dismissive", "Conclusion doesn't call to action"
4. `polish` node rewrites with those issues fixed — the final output is notably stronger than the first draft
