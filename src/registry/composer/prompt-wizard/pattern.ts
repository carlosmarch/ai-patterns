export const pattern = `# Prompt Wizard

## Summary
A prompt built one question at a time. Each step asks for one detail — who it's for, what tone, what to include — as a set of choices or a short text answer, while a live preview shows the prompt taking shape. The last step shows the finished prompt, editable, before it runs. It turns a blank box into a short, focused conversation for tasks where a good result needs several details people wouldn't think to give.

## When to use
- Complex requests with a known recipe: job posts, briefs, campaign copy, image prompts, research plans.
- People who are new to the task or to AI, and would write a one-line prompt and get a generic answer.
- When each detail has a small set of good answers that can be offered as choices.

## When not to use
- Quick requests that fit in one sentence; a wizard in front of them is pure friction.
- When people already know what they want and type fast — offer Prompt Template, which shows every blank at once on one line.
- When the questions depend on the request itself and can't be known in advance — use Clarifying Questions after the prompt is sent.
- More than about six steps. Split the task, or move rare details into an optional "Anything else?" step.

## Anatomy
- Header: the task name and "Step 2 of 5", with a segmented progress bar (one segment per step plus review).
- Step body: the question, an optional hint, and either choice chips (single choice) or a short text field. Optional steps are labelled.
- "Prompt so far": a muted, clamped line showing the prompt built from the answers given so far.
- Footer: Back, and Next (Skip on an empty optional step, Review on the last step).
- Review step: the answers as chips that jump back to their step, the full prompt in an editable field, and the run button.

## Behavior
- One question per screen. Steps slide in the direction of travel: forward from the right, back from the left.
- Clicking a choice selects it and moves to the next step after a short beat, so the selection registers before the screen changes. Arrow keys move the selection without advancing; Next confirms.
- Text steps advance with Enter or Next; Shift+Enter adds a new line. Next is disabled until a required step has an answer.
- Back keeps every answer. Going back and changing one rebuilds the prompt everywhere.
- The prompt is built by the product, not the model, so the preview updates instantly and exactly matches what will run.
- On review, the prompt can be edited by hand. A hand edit is kept until an answer changes or the person chooses "Rebuild from answers", so nothing they typed is overwritten silently.
- Running submits the reviewed prompt and the structured answers, which the host can store for "run again" or a template.

## Content guidelines
- Ask questions the way a colleague would: "How senior?", "What will they work on first?". Avoid form labels like "Seniority level".
- Keep choices to three to five short options. Put the most common first, and don't pre-select one.
- Give text steps a concrete example placeholder ("e.g. Redesign onboarding for our mobile app") rather than an instruction.
- Title the review step plainly ("Here's your prompt") and label the run button with the outcome ("Generate", "Write post").

## Accessibility
- The wizard is a labelled region named by the current question; the step counter is a polite live region.
- Focus moves to the new step's input or selected choice after each transition, and never on first load.
- Choices are a \`radiogroup\` with roving tab index: arrow keys move and select, and Space or Enter picks.
- Text steps are labelled by their question and described by their hint.
- Review chips say which step they change ("Change How senior?: Senior").
- Slides become plain fades, and the auto-advance is immediate, when the user prefers reduced motion.

## Related patterns
- **Prompt Template** — Use it instead to show the whole prompt as one sentence with blanks, for people who want to see everything at once.
- **Clarifying Questions** — Use it instead when the AI works out what to ask after reading the request.
- **Prompt Quality Meter** — Use it instead to coach a free-form prompt without forcing a sequence.
- **Setup Checklist** — Use it for multi-step product setup; this pattern is for one request.
`;
