export const pattern = `# Conversation Branches

## Summary
Editing a message that has already been sent creates a new branch of the conversation instead of overwriting it. A small ‹ 2 / 3 › switcher under the message moves between versions, and the assistant's reply follows whichever version is shown. People can explore a different phrasing without losing an answer they liked.

## When to use
- Chat assistants where people often rephrase a question to get a better answer.
- Exploratory work — naming, copy, ideas — where earlier answers stay useful after trying another angle.
- Any product that lets people edit sent messages: branching makes the edit safe to try.

## When not to use
- Comparing two answers to the same prompt side by side — use Response Compare.
- Small adjustments to an answer (shorter, more formal) — use Refinement Controls, which don't change the prompt.
- Linear records where history must not fork, such as support tickets or audit trails.

## Anatomy
- User message with an edit button (shown on hover, always visible on touch).
- Inline editor: the message text, a note that the original is kept, Cancel and Send.
- Version switcher: previous, "2 / 3", next — shown once there is more than one version.
- Reply area: the assistant's reply for the active version, with a placeholder while it is generated.

## Behavior
- Editing opens the message in place; Enter or Send creates a new branch and switches to it, Escape or Cancel leaves everything as it was. An unchanged or empty edit does nothing.
- The new branch shows a loading placeholder until its reply arrives; earlier branches keep their replies.
- Previous and next slide the message and reply together in the direction of travel, so it's clear the whole turn changed.
- Everything after the edited message belongs to its branch: switching versions swaps the rest of the conversation too.
- The host keeps the active version for each message, and new messages continue from the version on screen.

## Content guidelines
- Tell people the original is kept ("Sends as a new branch — the original is kept"), so editing doesn't feel destructive.
- Keep the counter terse: "2 / 3". Don't name versions.
- Label the edit action "Edit message", not "Regenerate" — it changes the question, not just the answer.

## Accessibility
- Edit, previous and next are buttons with accessible names; previous and next are disabled at the ends.
- The counter reads as "Version 2 of 3" to screen readers and is announced when it changes.
- The reply area is \`aria-busy\` while a branch is generating.
- The slide is skipped when the user prefers reduced motion; the counter still marks the change.

## Related patterns
- **Response Compare** — Use it instead to see two answers to the same prompt side by side.
- **Refinement Controls** — Use it instead to tweak an answer without rewriting the question.
- **Chat Bubble with Actions** — Use it as well; the edit button and version switcher sit alongside its copy and feedback actions.
- **Prompt Enhancer** — Use it as well to rewrite the prompt before sending it as a new branch.
`;
