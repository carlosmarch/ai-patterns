export const pattern = `# Describe Filters

## Summary
A "Describe" button in a table's toolbar that turns into a free-text field where the user says, in plain language, which rows they want ("Show me patterns for agent oversight"). The model translates the description into ordinary, removable filter chips. When a request maps onto a real column it becomes a column filter (Status · is · Beta); when no column covers it, it becomes a semantic filter (About · matches · agent oversight) that matches rows by meaning, visibly marked as such.

## When to use
- Tables with many columns or operators, where building a filter by hand takes several clicks.
- Requests that cut across the schema — topics, intents, or qualities that no single column captures ("gear for video calls", "customers at risk", "patterns for agent oversight").
- Alongside the existing keyword search and manual filter UI, as a faster path — never as the only way to filter.

## When not to use
- Small tables where a single dropdown or the keyword search already does the job.
- When results must be exact and auditable (financial reconciliation, compliance exports) and you can't express everything as column filters — don't let a semantic match silently decide what's in the set.
- As a chat interface. The output is filters on this table, not an answer or a summary.

## Anatomy
- **Describe button** — a pill with a sparkle icon, first in the toolbar, next to keyword search.
- **Describe field** — replaces the toolbar in place: cancel (×), text input, submit arrow.
- **Suggestions** — a small popover of example descriptions, shown only while the field is empty.
- **Pending state** — inline "Building filters" status in the field; the table dims but keeps its rows.
- **Filter chips** — Field · operator · value, each removable. Chips from the last description carry a small sparkle; semantic chips use a dashed border and an italic field name.
- **Interpretation bar** — a thin line under the toolbar: the description that produced the filters, the resulting row count ("6 of 24"), and an Edit action.
- **Empty state** — "No rows match these filters" with an "Edit description" action.

## Behavior
- Clicking Describe swaps the toolbar for the describe field with a short cross-fade and focuses the input. Esc or × restores the toolbar and returns focus to the Describe button.
- Enter (or a suggestion click) submits. While pending, the input is read-only and the table dims; existing rows stay visible so the layout doesn't jump.
- On success, the toolbar returns and the new chips animate in with a small stagger, then rows filter out with a fade and the remaining rows slide up.
- A new description replaces the chips from the previous description but keeps filters the user added by hand.
- Every generated chip is an ordinary filter: removable one by one, with "Clear all" when more than one is active. Removing the last generated chip hides the interpretation bar.
- Prefer column filters. Only fall back to a semantic filter when no column, or combination of columns, expresses the request — and say so on the chip (tooltip: "No column covers this — rows were matched by meaning").
- Edit (in the interpretation bar or the empty state) reopens the describe field pre-filled with the last description.
- On failure, keep the field open with the text intact and show an inline error under it — never clear what the user typed.

## Content guidelines
- Button label: "Describe". Placeholder speaks in the user's voice and names the table's subject: "Show me patterns for…", "Show me orders where…".
- Suggestions should demonstrate range: one that needs a semantic match, one that combines a concept with a column, one that only uses columns.
- Chip values are short and literal: the column's own vocabulary and formatting for column filters ("Oct 1, 2026", not "the start of October"); a 1–3 word concept for semantic ones.
- The interpretation bar quotes the description verbatim — don't rewrite what the user said.

## Accessibility
- The Describe button, chip remove buttons, and Edit are real \`<button>\`s; each remove button is labelled with the full filter ("Remove filter: Status is Beta").
- Active filters are a labelled list. The generated-chip sparkle has an accessible label ("Generated"); the semantic marker isn't conveyed by the dashed border alone — the italic field name and tooltip back it up, and the field name itself ("About") says it's not a column.
- The pending status is a \`role="status"\` region and the table carries \`aria-busy\` while pending; the interpretation bar is \`aria-live="polite"\` so the new row count is announced.
- Focus moves into the field on open and back to the Describe button on close or apply.
- Animations are short opacity/position transitions; respect \`prefers-reduced-motion\` by dropping the stagger and row slide.

## Related patterns
- Command Palette — keyword jump to a known item; Describe Filters narrows a set by intent.
- Refinement Controls — another free-form instruction that produces a reviewable, reversible result.
- Confidence Indicator — pair with semantic chips when the model can report how sure the match is.
`;
