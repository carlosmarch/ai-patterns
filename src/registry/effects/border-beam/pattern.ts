export const pattern = `# Border Beam

## Summary
A soft, multicolor glow that travels around the border of an AI input surface — a composer, a search field, an "ask AI" card. At rest it marks the surface as the place where AI lives; while the AI is working it laps faster and brightens, so the same frame doubles as a quiet activity signal.

## When to use
- The primary AI composer or command bar, to set it apart from ordinary text fields on the same screen.
- An AI-powered search field that sits next to a plain one, so people can tell which one reasons.
- As an ambient "working" state on the surface that started a run, when a separate loader would crowd the layout.

## When not to use
- On more than one or two surfaces per view. A beam on every card turns into noise and stops meaning "AI".
- As the only progress signal for long runs — pair it with a **Thinking Loader** or **Task List** that says what is happening and for how long.
- On destructive or error states. The playful color reads as success; use **Generation Error** styling instead.
- On dense lists or table rows, where the motion pulls the eye away from the content.

## Anatomy
- Wrapped surface: the existing composer or field, unchanged, with its own border and radius.
- Beam: two short arcs of color, drawn only on the 1px border ring.
- Glow: a blurred copy of the beam that bleeds a few pixels inward, never outward past the surface.

## Behavior
- Idle: the beam laps slowly (about 8 s per lap) at reduced opacity.
- Active (a prompt was sent, the agent is running): the lap halves and the beam and glow brighten; both ease back when the run ends.
- Disabled: remove the beam when the surface is hidden, read-only or not AI-backed — never leave it looping over a dead control.
- The beam fades in on mount instead of popping, and never changes the surface's size or layout.

## Content guidelines
- The beam carries no text. Put state in words elsewhere: the placeholder ("Building the Thinking Loader…"), a loader or a status line.
- Keep colors soft and in the product's palette; two arcs are enough. Avoid red, which reads as an error.

## Accessibility
- The beam and glow are decorative: \`aria-hidden\`, \`pointer-events: none\`, and never the only way state is conveyed.
- With \`prefers-reduced-motion\`, stop the rotation and show a static arc; the active state can still brighten.
- The beam must not lower the contrast of the surface's real border or focus ring — keep a visible focus indicator on the input itself.

## Related patterns
- **Shiny Button** — The same "this is special" signal for a single call to action instead of an input surface.
- **Prompt Bar** — The composer the beam most often wraps.
- **Thinking Loader** — Says what the AI is doing and for how long, which the beam alone cannot.
`;
