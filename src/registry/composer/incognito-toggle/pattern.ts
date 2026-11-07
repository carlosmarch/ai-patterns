export const pattern = `# Incognito Toggle

## Summary
A header control that turns the current chat into a temporary one, plus a banner that stays on screen for as long as it lasts and says exactly what is and isn't kept. It lets people talk to the assistant without the conversation landing in their history, memory or training data.

## When to use
- Assistants with history, memory or training on conversations, where some topics (health, money, a surprise gift) shouldn't stick.
- Shared or work accounts where a user wants to try something without it showing up for others.
- Testing a prompt without the assistant's memory colouring the answer.

## When not to use
- Products that don't keep conversations at all — there is nothing to turn off, so the toggle would mislead.
- As a substitute for real data controls. Pair it with Memory Panel and a data-retention setting.
- Mid-conversation, after messages have already been saved. Start a new temporary chat instead of converting an existing one.

## Anatomy
- Toggle: a pill button with an eye-off mark and a label, pressed when temporary mode is on. Can collapse to icon-only.
- Banner: icon, title, a specific description of what is kept, and an Exit button.
- Visual mode cue: the composer takes a dashed border and changes its placeholder, so the mode is obvious even when the banner scrolls away.

## Behavior
- The toggle is offered on a new, empty chat. Turning it on shows the banner and restyles the composer immediately.
- The banner stays for the whole temporary chat; it is not a dismissible toast.
- Exit (or turning the toggle off) ends temporary mode and starts a fresh normal chat; the temporary conversation is discarded, so confirm first if it has messages.
- While temporary, the assistant doesn't read or write memory, and the chat never appears in history or search.

## Content guidelines
- Name the mode plainly: "Temporary chat". Avoid "Incognito" in user-facing copy unless your brand already uses it — people confuse it with browser privacy.
- State the actual guarantees and any exceptions: "won't appear in history, won't update memory, won't be used for training. May be kept for up to 30 days for safety."
- Never promise more privacy than the system delivers.

## Accessibility
- The toggle is a button with \`aria-pressed\`; in icon-only form it carries an \`aria-label\` and tooltip.
- The banner is \`role="status"\`, so turning the mode on is announced.
- The mode is shown with text and border style, not colour alone.

## Related patterns
- **Memory Panel** — Use it as well to review and delete what was remembered, while this toggle stops remembering in the first place.
- **AI Disclosure Badge** — Use it as well when people also need to know which content the AI made, not just what it will keep.
- **Prompt Bar** — Use it as well, since this mode restyles the composer and uses its placeholder for the mode hint.
`;
