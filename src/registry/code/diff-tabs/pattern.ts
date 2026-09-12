export const pattern = `# Diff Tabs

## Summary
A row of per-file chips — each showing a file name and its add/delete line counts — that switch an inline diff viewer below between files. It lets the user flip through every file an agent touched without leaving the message, reading the actual changed lines rather than just a name and a count.

## When to use
- Right after (or instead of) a Diff Summary Card, when the user is likely to want to actually read the changes inline rather than open a separate diff viewer.
- A small-to-medium batch of files (roughly 2–8) where showing every file as a chip stays scannable in one row.
- Edits precise enough to render as real add/remove/context lines, not just a file-level description.

## When not to use
- A single file — skip the tab row and show its diff directly.
- Large batches (dozens of files): a wall of chips wrapping across many rows stops being scannable; fall back to a Diff Summary Card's list-plus-overflow instead.
- Binary or non-text changes (images, assets) — there's no line-level diff to render.

## Anatomy
- Tab row: one chip per file — file name (truncated, not wrapped) plus colored +N/-N counts — with the active file visually distinct (filled background) from the rest.
- Diff panel: header repeating the active file's name and counts, then the diff body.
- Diff body: one line per row, each tagged context / addition / removal, with removed and added lines tinted (not just colored text) so the eye can scan long files quickly.

## Behavior
- Selecting a chip swaps the diff panel's content; the swap should transition (a brief fade/slide), not hard-cut, so it reads as "same panel, new content" rather than a page change.
- Exactly one file is active at a time — this is a tab pattern, not a multi-select filter.
- The active chip and the diff header always show the same file name and counts; they must never fall out of sync.
- Long lines scroll horizontally within the diff panel rather than wrapping, which would break the line-by-line reading of a diff.

## Content guidelines
- File names show enough path to disambiguate same-named files in different folders; don't silently collapse to the basename.
- Additions and deletions are always shown together as +N/-N, even when one side is zero (omit only the zero side, e.g. a pure addition shows "+13" with no "-0").

## Accessibility
- The tab row and panel should use \`role="tablist"\`/\`role="tab"\` semantics (or equivalent) with \`aria-selected\` on the active chip, so the relationship between chip and panel is programmatic, not just visual.
- Chips must be reachable and operable by keyboard (arrow keys or tab order plus Enter/Space).
- Addition/removal styling must not rely on background tint alone if it's the only signal — keep the +/- marker in front of each line so the diff still reads in a high-contrast or no-color mode.

## Related patterns
- Diff Summary Card — the collapsed, file-list-only alternative for larger batches or when inline reading isn't the goal; Diff Tabs is the "let me actually read it here" counterpart.
`;
