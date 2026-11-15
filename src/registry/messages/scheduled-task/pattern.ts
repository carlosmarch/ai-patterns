export const pattern = `# Scheduled Task

## Summary
When the assistant offers to do something later ("Want me to pick this up tomorrow?") and the user accepts, the reply confirms it as a scheduled task right in the conversation: a "Scheduled task" tag, a card naming the task and when it will run, an edit control to change the time, and a "Run now" button. It turns a promise in prose into a visible, editable commitment.

## When to use
- When the AI can run work on its own at a later time (a follow-up draft, a recurring check, a next step of a longer project) and the user has just asked for or accepted that.
- When the natural end of a turn is "let's continue later" — the card replaces a vague "sure, tomorrow!" with something the user can check, adjust or trigger.
- In chat-first products where there is no separate automations screen the user would visit to set this up.

## When not to use
- When the product can't actually run anything unattended — a card that says "Tomorrow" but needs the user to come back and type is a broken promise; offer a reminder or a follow-up suggestion instead.
- For recurring, event-driven or multi-condition automations — use **Agent Triggers** or **Trigger Condition**, which have room for the configuration.
- For work that is running right now — use **Agent Run Card** or **Background Tasks Drawer** to show progress.

## Anatomy
- **Offer** (preceding turn): the assistant proposes the deferred work, ideally as a one-tap option the user can accept ("Draft the Cost Estimate states tomorrow"); once accepted it stays visible, dimmed with a check.
- **Tag**: a small "Scheduled task" pill heading the reply, so the turn reads as a system action, not just text.
- **Task card**: a leading icon, the task's title as a short imperative, and the schedule in plain words beneath ("Tomorrow, 9:00").
- **Edit control**: a pencil at the card's trailing edge that opens the schedule choices inline.
- **Run now**: a secondary pill under the card that runs the task immediately instead of waiting.
- **Confirmation line**: one sentence restating what will happen and where the result will show up.

## Behavior
- The card appears only after the task is really saved; while it's being created show a short "Scheduling…" state, not an optimistic card.
- The edit control expands the card in place with a few likely times (the current one selected); choosing one updates the card's schedule line and the confirmation line, and collapses the choices. Link out to a full scheduler for anything finer.
- "Run now" swaps the schedule line for a running state, then "Ran just now" with a check; the edit control and Run now disappear once the task has run, since there is nothing left to schedule.
- When the task runs on schedule, its result arrives in the same conversation (or a notification links back to it), so the card stays the anchor for "what did I ask for, and when".
- The card stays in the transcript afterwards and reflects the task's latest state (scheduled, running, ran, cancelled), rather than freezing at the moment it was created.

## Content guidelines
- Title the task as what the AI will do, in the user's words where possible ("Draft the Cost Estimate states"), not the system's ("Task #4821").
- Write the time relative and concrete: "Tomorrow, 9:00", "In 1 hour", "Monday, 9:00" — never a raw timestamp, and never just "Later".
- Keep the confirmation line to one sentence and say where the result will appear ("I'll tell you here when they're ready").
- Keep "Run now" literal; don't rename it to "Skip the wait" or similar.

## Accessibility
- The edit control is a real button with an accessible name that includes the task ("Change when “Draft the Cost Estimate states” runs") and \`aria-expanded\` tied to the choices it reveals.
- The time choices are a \`radiogroup\` of \`radio\` buttons so the current one is announced as checked.
- The schedule line is a polite live region, so switching to "Running now…" and "Ran just now" is announced.
- Status changes are conveyed in text, not only by the spinner or check icons, which are \`aria-hidden\`.

## Related patterns
- **Agent Triggers** — Use it when the task should fire on external events or a recurring schedule configured in a panel.
- **Wait Time Handoff** — Use it when the deferral is a timeout that hands work to a person or workflow.
- **Agent Run Card** — Use it to show the task once it's running or finished.
- **Follow-Up List** — Use it when the next step is a question to ask now rather than work to do later.
`;
