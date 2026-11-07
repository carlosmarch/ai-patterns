export const pattern = `# Clarifying Questions

## Summary
Before starting on an ambiguous request, the assistant replies with a short card of two or three questions, all visible at once, each pre-filled with its best guess and marked "Suggested". The person corrects only what's wrong and presses Start. The card then collapses into a summary of the details the assistant will use.

## When to use
- Requests where a wrong assumption is expensive: a deck, a report, a research run, a long generation.
- Requests that are clear in intent but missing two or three details that change the result (audience, length, tone, scope).
- When the assistant can make sensible guesses — pre-filling them turns a quiz into a quick check.

## When not to use
- When the request is already specific, or a wrong guess is cheap to fix afterwards. Just answer, and let Refinement Controls handle tweaks.
- Mid-task decisions that block an agent — use Human in the Loop Question, which pauses the run and walks through one choice at a time.
- More than three or four questions. Ask for the essentials, or break the work into a planning step (Plan Review).
- Confirming a specific risky action — use Tool Approval.

## Anatomy
- Intro line: why the assistant is asking, and that it has filled in guesses.
- Question groups: a numbered label and a row of option chips; the suggested option is pre-selected and tagged "Suggested".
- Optional "Other…" chip that reveals a text field.
- Footer: a live status ("Using my suggestions", "1 changed from my suggestions", "1 still to answer") and the Start button.
- Summary: after Start, a compact row of the chosen details as chips, with an edit button to reopen the questions.

## Behavior
- All questions show at once, so people can scan and change only what matters; there is no step-by-step flow.
- Questions with a suggestion are answered from the start, so Start works immediately. Questions without one block Start until answered.
- Choosing "Other…" reveals and focuses a text field; an empty one counts as unanswered.
- Start submits every answer and reports which ones the person changed, so the assistant can weight them.
- The card collapses to the summary and the assistant begins. The edit button reopens the questions with the previous answers.

## Content guidelines
- Ask only what changes the output. Each question should be answerable with a tap.
- Keep options to two to four short, mutually exclusive labels; put the most likely one first or mark it as suggested.
- Phrase the intro as help, not a gate: "A few quick questions so I get this right."
- The summary repeats the details in the user's words, so mistakes are easy to spot.

## Accessibility
- Each question is a \`<fieldset>\` with a \`<legend>\`; options are native radio inputs styled as chips, so arrow keys move between them and screen readers announce the group.
- Chips show a visible focus ring; the selected state is shown by fill and announced by the radio.
- The footer status is \`aria-live="polite"\` and the summary is \`role="status"\`.
- The edit button has an accessible name ("Change answers").

## Related patterns
- **Human in the Loop Question** — Use it instead when an agent is mid-run and must pause for one decision at a time.
- **Prompt Enhancer** — Use it instead when filling in the details silently is acceptable and the person can undo.
- **Plan Review** — Use it as well for longer tasks: clarify the details first, then confirm the plan.
- **Follow-Up List** — Use it instead to suggest next questions after an answer, not to gather input before one.
`;
