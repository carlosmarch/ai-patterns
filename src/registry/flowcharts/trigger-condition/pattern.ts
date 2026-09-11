export const pattern = `# Flowchart

## Summary
A vertical, read-at-a-glance diagram of a workflow's trigger and condition steps, laid out on a dotted canvas with a connecting line between nodes. Each step is a colored badge ("Trigger", "If / Else") above a white card, so the flow reads top-to-bottom like a sentence: "when this happens, and this is true, then...".

## When to use
- Automation / workflow builders where a user assembles trigger + condition + action steps (e.g. "when a new order is created, if flavor is X and topping is Y").
- Summarizing a rule or pipeline for review, where the exact sequence and branching matters more than density.

## When not to use
- For a linear list of steps with no branching or field-level detail — use Expandable Trace instead, it's lighter weight.
- As a full graph editor (drag-to-connect between arbitrary nodes, zoom/pan, rewiring the sequence itself). Cards here can be repositioned for readability, but the connector lines always follow the fixed node order passed in — this isn't a place to rewire what leads to what.
- When there are more than a handful of steps and horizontal branches — a vertical chain stops communicating structure once branches fork.

## Anatomy
- Canvas: a bordered, rounded container with a dotted background that visually separates the flow from surrounding UI.
- Node badge: a small colored pill labeling the node's kind ("Trigger" in violet, "If / Else" in amber), and the handle used to reposition that node. Color coding lets users scan a long flow for node types without reading every card.
- Node card: a white, rounded, shadowed card containing the node's content.
  - Trigger card: icon in a tinted rounded box, a bold title, and a one-line description.
  - Condition card: one row per clause. Each row has a drag handle, a connector word ("if" / "and" / "or"), a subject field chip (with icon), a comparison field chip, the word "is", and a value chip (a leading color dot + label) representing the selected option.
- Connector line: a straight line between consecutive nodes' centers, showing they execute in sequence. It follows the nodes live as they're dragged.

## Behavior
- Each node (badge + card together) is draggable within the canvas by its badge, so users can spread a dense flow out for readability. The card body itself stays free of drag interference so its own controls stay clickable.
- Field and value chips with an \`options\` list are real dropdown pickers: click to open, click an option to select it and close. A chip with no options renders as a plain, non-interactive label — don't show a chevron on it.
- Long values (e.g. a long topping name) wrap onto their own line, indented to align under the row's first field chip rather than the card edge, so the row still reads as one clause.
- Clause rows are reordered by dragging their grip handle; the rest of the row (its chips) stays inert during that drag so a click never gets mistaken for the start of a reorder.

## Content guidelines
- Trigger titles are short event names ("New order created"); descriptions restate them as a plain sentence for users who need the extra context.
- Connector words are lowercase ("if", "and", "or") to read as a natural sentence, not shouty labels.
- Value chips show the selected option's label verbatim (e.g. a specific flavor or topping name), not a truncated or reformatted version.

## Accessibility
- The dotted background is decorative only — mark it \`aria-hidden\` or apply it via CSS so it isn't announced.
- Connector lines between nodes are decorative; mark them \`aria-hidden\` too.
- Each chip that opens a picker needs a real \`button\` element (or equivalent) so it's reachable and operable by keyboard, not a styled \`span\`.

## Related patterns
- Expandable Trace is the lighter-weight, non-branching alternative for a simple ordered list of steps.
- Prompt Bar uses the same "chip with chevron opens a picker" idea for inline @ and / suggestions.
`;
