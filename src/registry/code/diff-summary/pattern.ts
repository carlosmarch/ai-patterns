export const pattern = `# Diff Summary Card

## Summary
A collapsed summary of a batch of file edits an agent just made: a count, an undo action, a "view changes" action, a per-file list of names with add/delete line counts, and an overflow expander for large batches. It lets the user trust that changes happened and skim their scope without reading every diff.

## When to use
- Immediately after an agent finishes a multi-file edit (a coding assistant, a batch content update, a config migration).
- When individual files have a clear, quantifiable diff (lines added/removed) worth surfacing at a glance.

## When not to use
- For a single-file edit — a one-line inline confirmation is enough; a whole card is overkill for one file.
- As the only way to inspect what changed. "View changes" must lead somewhere real (a diff viewer); this card is a summary, not a substitute for the actual diff.
- For edits that can't be undone. Only offer "Undo" when it actually reverts the change — a decorative Undo that doesn't work erodes trust fast.

## Anatomy
- Header: file count ("Edited N files"), an Undo action, a View changes action.
- File list: one row per file — an icon, the file name (truncated, not wrapped), additions/deletions counts, and an affordance that the row is clickable.
- Overflow control: "Show N more" beneath the first handful of rows, expanding in place.
- Footer: secondary actions (e.g. copy, pin, read aloud) and a timestamp.

## Behavior
- Show only the first handful of files (5–8) by default; collapse the rest behind "Show N more" so the card doesn't dominate the screen for large batches.
- Expanding the overflow list animates height smoothly rather than snapping; it does not replace or reflow the already-visible rows.
- Additions and deletions are always shown together (+N in one color, -N in another) so scanning the list gives an at-a-glance sense of which files grew, shrank, or were rewritten.
- Undo should act on the whole batch, not per file — this card represents one atomic change.
- Clicking a file row should open that file's specific diff, not the whole batch's.

## Content guidelines
- File names show their path when it disambiguates (e.g. two files with the same basename in different folders) — don't silently truncate to just the basename.
- The header count and the actual number of rows must always agree, including after expanding.

## Accessibility
- Each file row and the overflow toggle must be reachable and operable by keyboard, not just by mouse.
- Additions/deletions must not rely on color alone — the +/- sign already carries the meaning, so keep it even if you restyle the colors.
- The overflow toggle should update its accessible name/state (e.g. \`aria-expanded\`) when toggled.

## Related patterns
- Often appears as the terminal state of an agent turn, after a Thinking Loader/Expandable Trace sequence — the "here's what I actually changed" summary once work completes.
`;
