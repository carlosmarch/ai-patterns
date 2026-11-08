export const pattern = `# Prompt Autocomplete

## Summary
Ghost text that finishes the prompt while it's being written. After a short pause the model suggests how the sentence could continue, shown in faint text right after the caret. Tab takes all of it, Right Arrow takes one word, and typing on simply replaces it. It saves keystrokes on common requests and shows people what a fuller prompt looks like, without taking the pen away from them.

## When to use
- Composers where many prompts follow known shapes: "Summarize…", "Write a… for…", "Explain…".
- Products with a history of prompts or a template library that suggestions can be drawn from.
- Domain tools where the right vocabulary helps (query builders, support macros, code assistants).

## When not to use
- Sensitive or personal writing (health, legal, HR complaints), where suggested words put ideas in people's mouths.
- Short commands or search boxes where people know exactly what they want; a dropdown of suggestions, or nothing, fits better.
- When suggestions can't come back in well under a second. A late ghost lands after the person has moved on and reads as noise.
- To rewrite or expand a prompt that's already written — use Prompt Enhancer, which shows what it changed.

## Anatomy
- Prompt field: a normal textarea; the typed text never changes style.
- Ghost text: the suggested continuation in faint text, starting at the caret on the same line.
- Accept hint: a small "Tab to accept" chip that is also a tap target on touch screens.
- Send button.

## Behavior
- Ask for a suggestion only after a pause (around 300 ms) and only once the prompt has a few characters. Cancel the request the moment the text changes, and never show a suggestion made for different text.
- Suggest only when the caret is at the end of the text. Moving the caret into the middle, selecting text or leaving the field clears the ghost.
- Tab accepts the whole suggestion; Right Arrow accepts the next word and keeps the rest on screen; Escape dismisses it until the person types again.
- Typing a character that matches the ghost keeps the rest of the suggestion; anything else replaces it with a fresh request after the next pause.
- Tab is taken only while a ghost is showing. With no ghost, Tab moves focus as usual, so keyboard users are never trapped in the field.
- Enter sends what was typed, not the ghost. Accepting is always a separate, deliberate step.
- The ghost fades in quickly and disappears at once, so it never trails the typing. A failed or empty suggestion shows nothing at all.

## Content guidelines
- Suggest the rest of the sentence, not a new paragraph: one clause or a short phrase is enough.
- Continue in the person's own voice and wording; don't correct what they've typed.
- Keep the hint to "Tab to accept". Teach Right Arrow and Escape in onboarding or a tooltip, not on every suggestion.

## Accessibility
- The textarea keeps its label and sets \`aria-autocomplete="inline"\`; the ghost layer is \`aria-hidden\`, so it's never read as typed text.
- A polite live region announces a new suggestion with the keys to accept or dismiss it, and the textarea points to it with \`aria-describedby\` while it shows.
- The ghost must stay clearly different from typed text in both themes, by more than color alone where possible (lighter weight or opacity), and still readable.
- The accept chip is a real button, so touch and switch users can accept without a Tab key.
- The fade is skipped when the user prefers reduced motion.

## Related patterns
- **Prompt Enhancer** — Use it instead to rewrite a finished prompt into a more specific one, with the changes highlighted.
- **Prompt Quality Meter** — Pair it to show what a prompt is still missing, rather than guessing the words.
- **Prompt Template** — Use it instead when the prompt's shape is fixed and only a few blanks change.
- **Prompt Bar** — The basic composer this builds on.
`;
