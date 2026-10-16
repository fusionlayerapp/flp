# weekly-standup-summary

**What:** Runs every Monday morning, pulls recent context from memory, and emails a ready-to-share standup summary.

**When to use:** Individual contributors or teams who want standup prep automated. The routine pulls from the user's stored context (tasks worked on, conversations, notes) to generate a summary that's actually specific to their week — not a generic template.

**Example:**

Without routine: Monday morning, you stare at Slack trying to remember what you did last week.

With routine: At 8am UTC on Monday, the engine queries your recent memory for completed tasks and blockers, generates a 6-bullet standup in your voice, and delivers it to your inbox. You can copy-paste directly or lightly edit before posting.

The `jitter_mins: 10` spreads delivery slightly to avoid all users hitting the same execution time.
