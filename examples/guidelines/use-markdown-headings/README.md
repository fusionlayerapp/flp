# use-markdown-headings

**What:** Enforces consistent Markdown structure — headings, lists, and code blocks — for all multi-part responses.

**When to use:** Interfaces that render Markdown (chat UIs, docs, Notion, Slack with formatting). Especially useful for technical assistants where responses mix explanation, code, and commands.

**Example:**

Input: `"How do I set up a Node.js project from scratch?"`

Without guideline: A wall of prose with inline code and no visual hierarchy.

With guideline: Response is organized with `## Initialize the project`, `## Install dependencies`, `## Project structure` sections, shell commands in fenced code blocks, and a bullet list of recommended dev dependencies.
