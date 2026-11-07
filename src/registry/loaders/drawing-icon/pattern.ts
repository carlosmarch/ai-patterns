export const pattern = `# Drawing Icon

## Summary
A line icon that draws itself stroke by stroke, holds for a beat, then erases and starts again — used as the "working" glyph for a specific kind of activity (searching, thinking, writing, making an image). Because it's the activity's own icon rather than a generic spinner, it says *what* is happening as well as *that* something is happening.

## When to use
- Next to a status label while an agent runs a step whose kind you know ("Searching the web", "Creating image").
- In tool-call chips, step lists or traces where each step type already has an icon — animate the icon of the step that is running.
- When duration is unknown and you want a calmer, more characterful signal than a spinner.

## When not to use
- When you know real progress — use a progress bar.
- For more than one running step in the same view; several icons drawing at once reads as noise. Animate only the active one and show the rest static.
- With dense, filled or very detailed icons — the effect needs a few clean strokes to read.
- As decoration on idle UI. Motion should mean "working right now".

## Anatomy
- Icon: a 24×24 stroke icon split into its individual paths (2–7 strokes works best), drawn in path order.
- Optional ghost: a faint, static copy of the full icon underneath, so the shape is recognisable at every frame, including the empty one.
- Label (outside the component): the present-participle verb for the step.

## Behavior
- Each stroke animates its dash offset: draw on (~45% of the loop), hold fully drawn (~20%), then slide off the far end (~35%), easing in and out. Default loop is 3.6s.
- Strokes start staggered (default 0.3s apart), so the icon builds up in sequence rather than all at once.
- Works for any path: every stroke is normalised with \`pathLength="1"\`, so one keyframe set fits every shape.
- When the step changes, swap the icon (remount it so it starts drawing from empty) and the label together.
- When the step finishes, pause it: it settles on the fully drawn icon, which then becomes the step's static "done" glyph.

## Content guidelines
- Pick the icon that matches the actual activity; don't show a globe unless something is actually being searched.
- Pair it with a short label — the icon alone is a hint, not a status.
- Order paths so the drawing reads naturally: outline first, details last.

## Accessibility
- The icon is decorative (\`aria-hidden\`) when a visible label sits next to it; otherwise pass a \`label\` so it's announced as an image.
- Put the status label in an \`aria-live="polite"\` region so step changes are announced.
- With \`prefers-reduced-motion\`, the icon is shown fully drawn and only gently pulses its opacity.

## Related patterns
- **Thinking Loader** — Use it as well, replacing its static glyph with a Drawing Icon for the step that is running.
- **Tool Call Chip** — Use it as well to animate the chip's icon while the call runs.
- **Analysis List** — Use it as well to animate only the active step's icon.
`;
