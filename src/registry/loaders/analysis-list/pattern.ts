export const pattern = `# Analysis List

## Summary
A batch-processing loader: a full-width indeterminate progress bar sits above a list of items, and each item's thumbnail, title, and detail line resolve from a skeleton to real content one at a time, top to bottom, as the AI finishes analyzing it.

## When to use
- The AI is running the same analysis step over a known set of items — scanning uploaded photos, classifying a batch of documents, extracting metadata from files — and results arrive incrementally in a stable, known order.
- You already know how many items there are (so a list of rows can be rendered up front) but not yet what any individual result looks like.

## When not to use
- A single long-running operation with no distinct sub-items — use Thinking Loader instead.
- Work whose item count or order isn't known in advance (e.g. items streaming in one by one from a search) — skeleton placeholders imply a fixed, already-known list.
- When each item's result is already available immediately (no per-item latency) — just render the list; a skeleton that appears and clears in one frame is noise.

## Anatomy
- Indeterminate bar: a thin (4px), full-width track at the top of the list container with a short filled segment sweeping back and forth.
- Item rows, each with:
  - Thumbnail (fixed square, rounded corners); falls back to a generic icon when the item has no image or it fails to load — never a broken-image glyph.
  - Title line.
  - Secondary info line (smaller, muted).
  - Trailing status glyph: nothing while queued, a spinner while loading, a check once done.

## Behavior
- On mount, the first item is "loading" and every other item is "pending"; only one item loads at a time.
- A "pending" item's thumbnail and text render as static (non-animated), dimmed (~50% opacity) skeleton blocks — visually queued, not yet being worked on.
- A "loading" item's skeleton blocks switch to a pulsing animation and its trailing glyph shows a spinner — this is the one item actively resolving.
- The instant an item's real data is available, its skeletons are replaced by the actual thumbnail, title, and info text in place (no layout shift — skeleton and content occupy the same dimensions), the spinner is replaced by a check, and the next item flips from "pending" to "loading".
- The top progress bar keeps sweeping for as long as any item is not yet "done". The moment the last item finishes, unmount the bar entirely (collapse its height, don't just stop the sweep) — a finished list has no loading affordance left on screen.
- Rows never reorder during the process — position is stable; only each row's content state changes.

## Content guidelines
- Title: the item's real name/subject once known — a filename, a detected object, a person's name. Keep it one line, truncate with ellipsis rather than wrap.
- Info line: one short classification or metadata fragment ("Document · 3 pages", "Matches Tool Call Chip"), not a full sentence.
- Never show placeholder text ("Loading...", "TBD") inside a skeleton block — the skeleton shape itself communicates "not ready yet."
- Row text runs small (title and info are both secondary to the thumbnail/status glyph) — this is a scan list, not prose; keep both lines short enough that truncation is rare.

## Accessibility
- Mark the progress bar \`role="progressbar"\` and omit \`aria-valuenow\` (it's indeterminate); set \`aria-valuetext\` to "In progress" while it's mounted.
- Wrap the item list in an \`aria-live="polite"\` region so each reveal is announced without interrupting the user; mark a row \`aria-busy="true"\` while it is the active loading item.
- Respect \`prefers-reduced-motion\`: keep the skeleton-to-content swap (it's informational) but reduce the sweeping bar and pulsing skeleton to a static or much subtler state.
- Thumbnail images use empty \`alt=""\` when the adjacent title already names the item, to avoid redundant announcements.

## Related patterns
- Thinking Loader — the right choice for a single undifferentiated task instead of a list of sub-items.
- Tool Call Chip — a single inline chip's running → done transition, useful as the trailing glyph's model for this pattern's per-row status.
`;
