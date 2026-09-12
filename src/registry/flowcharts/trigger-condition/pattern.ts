export const pattern = `# Flowchart

## Summary
A read-at-a-glance diagram of a workflow's trigger and condition steps, laid out on a dotted canvas with a connecting line between nodes. Each step is a colored badge ("Trigger", "If / Else") above a white card, so the flow reads top-to-bottom by default like a sentence: "when this happens, and this is true, then...". Every card can be dragged freely to any position on the canvas — not just reordered vertically — and the connector redraws live to keep the two ends linked.

## When to use
- Automation / workflow builders where a user assembles trigger + condition + action steps (e.g. "when a pull request is opened, if files changed is greater than 50 and path matches src/registry/**").
- Summarizing a rule or pipeline for review, where the exact sequence and branching matters more than density.
- When users benefit from spatially rearranging steps (e.g. to make room for annotations, or to group related steps) without that rearrangement changing execution order.

## When not to use
- For a linear list of steps with no branching or field-level detail — use Expandable Trace instead, it's lighter weight.
- As a fully interactive node-based editor (drag-to-connect new edges, zoom/pan, arbitrary graph topology, multiple outgoing branches). This pattern keeps a fixed sequence of nodes that can be repositioned; build a dedicated canvas editor for free-form graphs.
- When there are more than a handful of steps and horizontal branches — a single chain of nodes stops communicating structure once branches fork.

## Anatomy
- Canvas: a bordered, rounded container with a dotted background that visually separates the flow from surrounding UI. Its height is sized to the flow's default stacked layout.
- Node badge: a small colored pill labeling the node's kind ("Trigger" in violet, "If / Else" in amber), paired with a drag handle used to reposition the whole card. Color coding lets users scan a long flow for node types without reading every card.
- Node card: a white, rounded, shadowed card containing the node's content, absolutely positioned on the canvas so it can be dragged anywhere within it.
  - Trigger card: icon in a tinted rounded box, a bold title, and a one-line description.
  - Condition card: one row per clause. Each row has a drag handle, a connector word ("if" / "and" / "or"), a subject field chip (with icon), a comparison field chip, the word "is", and a value chip (a leading color dot + label) representing the selected option.
- Connector line: a curved line between consecutive nodes (bottom of one to top of the next), showing they execute in sequence regardless of where each card currently sits on the canvas.

## Behavior
- Each card's badge-row drag handle moves that card freely in both x and y; the sequence of steps (and therefore execution order) is unaffected by where a card is dropped — only its position on the canvas changes.
- The connector between two nodes recalculates on every drag frame, so it always runs from the bottom of the upstream card to the top of the downstream card no matter how far either has been moved.
- Dragging is clamped to stay inside the canvas bounds so a card can never be dropped off-canvas or outside the connector's reach.
- Field and value chips are dropdown triggers (chevron affixed) even in a read-only summary — they signal "this is configurable," not just descriptive text. They keep working normally after a card has been repositioned.
- Long values (e.g. a long file path) wrap onto their own line, indented to align under the row's first field chip rather than the card edge, so the row still reads as one clause.
- The drag handle on each clause row implies clauses are reorderable within their card; only show it when reordering is actually supported.

## Content guidelines
- Trigger titles are short event names ("New order created"); descriptions restate them as a plain sentence for users who need the extra context.
- Connector words are lowercase ("if", "and", "or") to read as a natural sentence, not shouty labels.
- Value chips show the selected option's label verbatim (e.g. a specific file path or category name), not a truncated or reformatted version.

## Accessibility
- The dotted background is decorative only — mark it \`aria-hidden\` or apply it via CSS so it isn't announced.
- Connector lines between nodes are decorative; mark them \`aria-hidden\` too.
- Each chip that opens a picker needs a real \`button\` element (or equivalent) so it's reachable and operable by keyboard, not a styled \`span\`.

## Related patterns
- Expandable Trace is the lighter-weight, non-branching alternative for a simple ordered list of steps.
- Prompt Bar uses the same "chip with chevron opens a picker" idea for inline @ and / suggestions.
`;
