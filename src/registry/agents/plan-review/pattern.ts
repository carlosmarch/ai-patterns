export const pattern = `# Plan Review

## Summary
Before an agent starts a long or expensive task, it shows the steps it intends to take as an editable list. The person can reword, reorder, remove or add steps, ask for a different plan, and then approve. Nothing runs until they do, and once approved the plan locks and becomes the record of what the agent was asked to do.

## When to use
- Agent runs that are slow, costly or hard to undo: building an app, generating a deck, a multi-source research run, a data migration.
- Tasks where the agent's interpretation can easily diverge from what was meant, so the cheapest moment to correct it is before any work.
- Contexts where people are accountable for what the agent does and need to sign off on it.

## When not to use
- Quick tasks where a wrong start costs seconds. Showing a plan for every request adds friction; show it above a cost or time threshold.
- Showing progress once the run has started — use Task List, which takes over from the approved plan.
- Approving one specific tool call — use Tool Approval.
- Gathering missing preferences — use Clarifying Questions first, then show the plan.

## Anatomy
- Header: title, a note that nothing runs until approval, an optional estimate, and an "Edited" tag once the plan has been changed.
- Step rows: a drag handle, a step number, the step text (click to edit) and a remove button.
- Footer: Add step, New plan, and the primary "Approve & run".
- Approved state: the plan locks, numbers fill in, and the footer confirms the agent is working.

## Behavior
- Steps can be dragged by their handle; with the keyboard, Alt+↑/↓ moves the focused step, Enter edits it, Delete removes it.
- Editing happens inline; Enter or leaving the field saves, Escape cancels, and clearing a step removes it.
- Add step appends an empty row in edit mode.
- New plan asks the agent for a fresh plan; the list dims and controls lock until it arrives, and edits to the old plan are discarded.
- Approve trims empty steps, locks the list and hands the final steps to the agent, which should follow them as written — if it has to deviate, it should say so in the Task List or trace.

## Content guidelines
- One outcome per step, as an imperative phrase: "Draft a 5-slide summary deck".
- Keep plans to three to seven steps; group detail inside steps rather than listing every tool call.
- Put the cost or time estimate in the header so people weigh the plan against it.
- Say plainly that nothing has run yet: "Nothing runs until you approve."

## Accessibility
- Steps are a list; each row is focusable with an accessible name including its position ("Step 2 of 4: …") and a description of the keyboard commands.
- Reordering has a keyboard path (Alt+arrow keys) as well as dragging, and moves are announced through a polite live region ("Moved to position 3 of 4").
- Remove and edit are reachable without a mouse; the remove button stays visible on touch screens.
- The approved state is announced as a status.

## Related patterns
- **Task List** — Use it as well; it shows progress through the approved plan once the agent starts.
- **Tool Approval** — Use it instead to approve a single action rather than a whole plan.
- **Clarifying Questions** — Use it as well, before the plan, when key details are missing.
- **Cost Estimate** — Use it as well when the plan's price should be weighed before approval.
- **Procedure Builder** — Use it instead for reusable procedures people author, rather than a one-off plan the agent proposes.
`;
