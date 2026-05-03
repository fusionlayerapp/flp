# meeting-summary

**What:** Produces a structured meeting summary — decisions, action items, and open questions — when the user pastes a transcript or notes.

**When to use:** Productivity and workspace assistants. Fires when users ask to summarize meetings, calls, or transcripts. Ensures consistent output format that integrates cleanly into project management tools or team wikis.

**Example:**

Input: `"Summarize this meeting"` + raw Zoom transcript

Without intent: Model produces a flowing paragraph summary that buries action items in prose.

With intent: Output is divided into Summary, Key Decisions, Action Items (with owners where mentioned), and Open Questions — ready to paste into Notion, Linear, or an email.
