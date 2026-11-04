export const pattern = `# Task List

## Summary
A compact, agent-authored plan: a short ordered list of steps the agent intends to take, each marked with a status glyph — a dashed ring while pending, a spinning arc while in progress, and a filled check once completed. It updates live as the agent works, so the user can see at a glance what's done, what's happening now, and what's next.

## When to use
- An agent is executing a multi-step task (coding, research, a migration) and has broken it into a plan up front.
- The user benefits from seeing the remaining scope — to judge how long the run will take, or to interrupt before a step they disagree with.
- Steps are coarse (3–8 items), each a meaningful unit of work rather than an individual tool call.

## When not to use
- A single undifferentiated operation — use Thinking Loader.
- Showing the raw sequence of tool calls or reasoning — use Expandable Trace; a task list is the plan, not the log.
- Steps the user must complete themselves — use Setup Checklist, which makes rows actionable.
- Parallel sub-agents each with their own steps — use Multi-Agent Trace.

## Anatomy
- Container: a bordered, rounded card holding an ordered list.
- Row: status glyph + label, top-aligned so wrapped labels stay readable.
- Status glyph — pending: a dashed, muted ring ("not started", without implying failure).
- Status glyph — in progress: a spinning partial arc over a faint track, in the foreground color.
- Status glyph — completed: a filled muted circle with a check.
- Label: one line where possible; the in-progress row is emphasised (medium weight) and completed rows fade to muted text.

## Behavior
- At most one task is in progress at a time in a sequential plan; the next pending task flips to in progress as the previous one completes.
- Status changes swap the glyph with a short spring (scale + fade) in place — rows never reorder or shift.
- The agent may revise the plan mid-run: new tasks are appended or inserted where they'll execute, and obsolete ones removed, without resetting completed rows.
- Optionally show a present-continuous label ("Running the build") while a task is in progress, reverting to the imperative label ("Run the build") once done.
- When every task is completed, the list stays visible as a record of what was done; no extra success state is needed.

## Content guidelines
- Write each label as an imperative verb phrase describing an outcome: "Add a Task List pattern", not "Adding stuff" or "Step 2".
- Keep labels concrete and scoped — the user should be able to tell what changes when a row turns complete.
- Prefer 3–8 tasks. Fewer means the plan isn't worth showing; more means the steps are too granular.
- Don't put timing, file paths, or tool names in the label — those belong in the trace.

## Accessibility
- Render as an ordered list (\`<ol>\`) with an accessible name that includes progress ("Agent plan, 1 of 3 completed").
- Each glyph is decorative (\`aria-hidden\`); expose status as visually hidden text before the label ("Completed: …", "In progress: …").
- Mark the in-progress row with \`aria-current="step"\`.
- Don't make the whole list a live region — announce only meaningful transitions (a task completing) if needed, to avoid chatter.
- Respect \`prefers-reduced-motion\`: stop the arc spinning; the partial arc alone still reads as "in progress".
- Status is never conveyed by color alone — each state has a distinct glyph shape.

## Related patterns
- Setup Checklist — the user-actionable counterpart, where rows are steps the person completes.
- Multi-Agent Trace — for plans split across parallel sub-agents.
- Expandable Trace — the detailed log of what happened during each step.
- Background Tasks Drawer — for monitoring long-running work outside the conversation.
`;
