export const pattern = `# Prompt Bar

## Summary
The primary text composer for talking to an agent: a single input that also supports inline \`@\`-mentions of context/sources, \`/\`-slash commands, a model picker, and voice dictation, all without leaving the text field.

## When to use
- The main input for a chat/agent interface where users need to both type free text and quickly reference structured things (files, people, data sources) or trigger canned actions inline.

## When not to use
- A simple, single-purpose text field with no mentions, commands, or model choice — use a plain input. Don't add this pattern's complexity where none of it is needed.
- A model picker when the product only ever has one model — remove unused affordances rather than showing a picker with a single option.

## Anatomy
- Leading add/attach action.
- Auto-growing text field.
- Inline \`@\`/\`/\` autocomplete popover.
- Trailing model picker.
- Dictation toggle.
- Send button.

## Behavior
- \`@\` opens a source/context picker filtered as the user keeps typing; \`/\` opens a command picker the same way.
- Arrow keys move the highlighted suggestion; Enter or Tab accepts it; Escape dismisses the popover without clearing what was typed.
- Plain Enter (no popover open) submits the message; Shift+Enter inserts a newline.
- The send button is visually inactive until there is non-whitespace content.
- The model picker and dictation toggle are independent of the text content and can be changed at any time, including mid-draft.
- Dictation shows an unambiguous "listening" state (e.g. a pulsing indicator) so it's never unclear whether the mic is live.

## Content guidelines
- Mention and command labels are short, recognizable nouns/verbs.
- Command descriptions (shown secondary to the label) state what the command does in a few words, not a full sentence.

## Accessibility
- The autocomplete popover must be fully operable from the keyboard — it's the primary interaction path, not a mouse-only nicety — and should communicate the current highlighted item to assistive tech.
- The model picker and dictation toggle need explicit \`aria-label\`s since they're icon-only or short-label controls.
- Respect \`prefers-reduced-motion\` for the dictation pulse; fall back to a solid color change instead of an animated ring.

## Related patterns
- Typically pairs with Thinking Loader / Expandable Trace (the agent's working/done states) and Streaming Text (the reply) to form a full turn of conversation.
`;
