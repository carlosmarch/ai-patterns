export const pattern = `# Shiny Button

## Summary
A primary call-to-action button with a looping light-sweep animation across its surface. The motion exists purely to draw the eye to the single most important action on the screen.

## When to use
- The one primary CTA on a screen (hero "Get Started", "Upgrade", "Try it now").
- Actions that begin the product's core flow.

## When not to use
- Secondary or tertiary actions — use a plain or outline button instead.
- More than one per view. The animation only works as a signal if it's rare; two shiny buttons on screen cancel each other out.
- Destructive actions (delete, cancel subscription). The celebratory motion sends the wrong emotional signal.
- A button that stays disabled or pending for a long time — stop the animation rather than looping over a dead action.

## Anatomy
- Label (text or short phrase).
- Looping sheen overlay (decorative, non-interactive).
- Press feedback (slight scale-down on tap/click).

## Behavior
- The sheen loops continuously and indefinitely while the button is enabled — it is not tied to a loading state.
- Press/tap gives immediate tactile feedback (subtle scale), independent of the sheen loop.
- On disabled state: stop the sheen animation and reduce opacity. A looping animation on a dead button reads as broken, not exciting.

## Content guidelines
- Short imperative verb phrase: "Get Started", "Try it", "Upgrade". No trailing punctuation.

## Accessibility
- Must render as a real \`<button>\` or link element, not a styled \`<div>\`.
- The sheen must never reduce the label's contrast below WCAG AA against the button background.
- The animation is decorative only — pause or remove it when the user has \`prefers-reduced-motion\` set.

## Related patterns
- None. This is a standalone action affordance, not part of an agent-status sequence.
`;
