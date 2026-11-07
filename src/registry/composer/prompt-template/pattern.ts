export const pattern = `# Prompt Template

## Summary
A prompt written as a sentence with blanks: fixed text around inline slots that the person fills in — free-text fields that grow as they type, or choice slots with a short list. It gives people a proven prompt structure while leaving the parts that matter to them, and the result is a normal prompt they can see in full.

## When to use
- Repeated tasks with a known shape: emails, product descriptions, job posts, image prompts with style and subject.
- Teams that want consistent output, where the template carries the house structure and people supply the specifics.
- Onboarding, to show what a good prompt looks like while letting people succeed on the first try.

## When not to use
- Open-ended questions and conversation. A template boxes in what should be free.
- When the right details vary wildly from one request to the next — use Clarifying Questions, which can ask about whatever is missing.
- Long forms. More than four or five slots stops reading as a sentence; use a proper form instead.

## Anatomy
- Optional title: which template this is.
- Sentence: fixed text with slots inline, wrapping like prose.
- Empty slot: dashed outline with a placeholder naming what goes there ("recipient", "topic").
- Filled slot: solid, tinted, medium-weight text.
- Choice slot: the same chip with a chevron, opening a native list.
- Footer: how many blanks are left, and the Run button.

## Behavior
- Free-text slots grow with their content, so the sentence keeps reading naturally.
- Tab and Shift+Tab move between slots in reading order.
- Slots can be pre-filled with sensible defaults; optional slots can be left empty and are dropped cleanly from the final prompt.
- Run with a required slot empty marks it, gives it a short shake and moves focus to it, instead of submitting.
- Submitting sends the sentence with the values filled in — exactly what the person sees — plus the slot values for structured use.

## Content guidelines
- Write the fixed text as a natural sentence; read it aloud with example values to check it flows.
- Name slots by what goes in them, in lower case: "audience", not "Enter target audience here".
- Keep choice lists short (two to five) and default to the most common option.
- Offer templates by outcome ("Follow-up email"), not by technique ("Few-shot prompt").

## Accessibility
- Each slot is a real input or native select with an accessible name from its placeholder, so screen readers announce the sentence and its fields in order.
- Empty required slots get \`aria-invalid\` after a failed Run, and the remaining-blanks count is announced through an \`aria-live\` region.
- The Run button stays focusable when blanks remain (\`aria-disabled\`) so it can explain the problem instead of doing nothing.
- Slot states differ by border style (dashed or solid) and weight, not colour alone.

## Related patterns
- **Prompt Bar** — Use it instead for open-ended prompts; offer templates as a starting point from its empty state.
- **Prompt Enhancer** — Use it instead when people would rather type freely and let the AI add the missing detail.
- **Prompt-Driven Onboarding** — Use it as well; templates make good first prompts during onboarding.
- **Clarifying Questions** — Use it instead when the details that matter can't be known in advance.
`;
