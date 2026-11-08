export const pattern = `# Prompt Quality Meter

## Summary
A small meter under the prompt that fills up as the prompt gets more specific, with a chip for each detail that helps (task, audience, format, length or tone) and one tip for the next detail missing. It answers "is this enough to get a good answer?" before the person sends, and teaches what a strong prompt has in it. It never blocks sending.

## When to use
- Products where vague prompts lead to generic answers, and people often have to send a second message to clarify.
- Tasks with a known recipe for a good request: drafting copy, briefs, image prompts, data questions.
- New users who don't yet know what an AI tool needs from them.

## When not to use
- Conversational follow-ups ("make it shorter", "why?"), where a short message is the right message.
- Expert tools whose users write precise prompts already; the meter becomes clutter they learn to ignore.
- As a gate. If a prompt must have certain details before it can run, ask for them with Prompt Wizard or Prompt Template instead of scoring the person.
- To rewrite the prompt for them — use Prompt Enhancer.

## Anatomy
- Prompt field and Send button.
- Meter: a few segments and a level label ("Vague", "Basic", "Good", "Specific"), inside the field next to Send.
- Detail chips under the field: a filled chip with a check for each detail that's covered, and a dashed chip with a plus for each one that's missing.
- Tip line: one sentence about the first missing detail.

## Behavior
- Nothing shows until the prompt has a few characters, so an empty field isn't scored.
- The score updates after a short pause in typing (around 350 ms), not on every keystroke, so chips and segments don't flicker.
- Segments fill in proportion to the details covered. The top level is reserved for prompts that cover all of them.
- A missing chip is also an action: clicking it adds a fill-in phrase (" for [audience]") and selects the bracketed part, so typing replaces it. A missing task goes at the start of the prompt, other details at the end.
- The tip names only the next missing detail. Once everything is covered it says the prompt is specific enough and stops coaching.
- Send works at every level. The meter informs and never disables or delays sending.
- Checks can be simple keyword heuristics or a fast model call. Either way, they must be quick and private enough to run while the person types.

## Content guidelines
- Use four or five details at most, named as plain nouns: "Audience", "Format", "Length or tone".
- Write tips as advice with an example, not as criticism: "Say who it's for", not "Your prompt lacks an audience".
- Avoid scores and percentages. Words and segments are enough, and a number invites gaming.
- Keep fill-in phrases short and in the same voice as the prompt. Use bracketed placeholders that read naturally: "[audience]", "[100] words".

## Accessibility
- The meter has \`role="meter"\` with an accessible name, the score as its value and a text version ("Basic: 2 of 4 details"). The textarea points to it with \`aria-describedby\`.
- Covered chips say "included" and missing ones say "missing — add it" to screen readers, so the state isn't conveyed by the check and dashed border alone.
- Missing chips are real buttons; after one is clicked, focus moves back to the textarea with the placeholder selected.
- The tip is a polite live region, and it only changes when the next missing detail changes.
- Segment fills are instant when the user prefers reduced motion.

## Related patterns
- **Prompt Enhancer** — Use it instead to rewrite a short prompt into a specific one in a single step.
- **Prompt Wizard** — Use it instead when the details are required, and ask for them one at a time.
- **Prompt Autocomplete** — Pair it to suggest the words, while the meter suggests what's missing.
- **Clarifying Questions** — Use it instead when the AI should ask for missing details after the prompt is sent.
`;
