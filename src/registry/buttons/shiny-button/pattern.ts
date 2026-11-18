export const pattern = `# Shiny Button

## Summary
A primary call-to-action button with a looping light-sweep animation across its surface. The motion exists purely to draw the eye to the single most important action on the screen.

## When to use
- The one primary CTA on a screen (hero "Generate spec", "Run scout", "Draft with AI").
- Actions that kick off the product's core AI flow — generating, drafting, running an agent.

## When not to use
- Secondary or tertiary actions — use a plain or outline button instead.
- More than one per view. The animation only works as a signal if it's rare; two shiny buttons on screen cancel each other out.
- Destructive actions (delete, cancel subscription). The celebratory motion sends the wrong emotional signal.
- A button that stays disabled or pending for a long time — stop the animation rather than looping over a dead action.

## Anatomy
- Leading icon — Sparkles by default, marking the action as AI-powered (decorative, hidden from assistive tech).
- Label (text or short phrase).
- Border beam — two soft multicolor arcs circling the border, painted on the button's own border so it sits flush against the fill (decorative, optional).
- Looping sheen overlay (decorative, non-interactive).
- Press feedback (slight scale-down on tap/click).

## Behavior
- The sheen loops continuously and indefinitely while the button is enabled — it is not tied to a loading state.
- The border beam laps slowly (about 6s) and independently of the sheen; the two layers should read as one ambient "AI" shimmer, not compete.
- Draw the beam on the button's own border, not on a wrapper around it — a separate ring leaves a hairline gap or anti-aliased seam between beam and fill.
- Press/tap gives immediate tactile feedback (subtle scale), independent of the sheen loop.
- On disabled state: stop the sheen and beam animations and reduce opacity. A looping animation on a dead button reads as broken, not exciting.

## Content guidelines
- Short imperative verb phrase naming what the AI will do: "Generate spec", "Run scout", "Draft with AI". No trailing punctuation.
- Name the outcome, not the technology — the sparkles already say "AI", so "Generate spec" beats "Ask AI".
- Only use the sparkles icon for actions that actually call a model; drop it (\`icon={null}\`) for plain CTAs.

## Accessibility
- Must render as a real \`<button>\` or link element, not a styled \`<div>\`.
- The sheen must never reduce the label's contrast below WCAG AA against the button background.
- The animation is decorative only — pause the sheen and freeze the beam at a fixed angle when the user has \`prefers-reduced-motion\` set.

## Related patterns
- **Border Beam** — The same beam for a larger surface (a composer or card); Shiny Button builds it into the button.
- **Agent Setup Pill** — Use it instead when the call to action is connecting an agent, and don't show both on one screen.
- **Stop Generation Button** — Use it instead when the button controls a running generation rather than inviting a first click.
`;
