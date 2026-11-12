export const pattern = `# Composer Question

## Summary
When an agent needs one decision to keep going, the question docks right above the composer as a short numbered list. One click, a number key or Enter answers it on the spot. A last "Something else" row turns into a text field, Skip lets the agent use its own guess, and the composer below stays live, so typing a reply answers too. Once answered, the card folds away and the reply shows up in the thread like any other message.

## When to use
- An agent is mid-task and blocked on a single choice with a few clear options (which variant, which scope, which file).
- Keyboard-heavy products (coding agents, command-driven tools) where people expect to answer without reaching for the mouse.
- The answer should read as part of the conversation, not as a separate form.

## When not to use
- Several related questions that are best answered together: use Clarifying Questions (all at once, before the task) or Human in the Loop Question (stepped, with Continue).
- Approving a specific risky action with its exact details: use Tool Approval.
- Open-ended questions with no likely answers. Just ask in the message and let people type.
- When the agent can make a safe, reversible guess: make it and say so, rather than stopping the run.

## Anatomy
- **Question card**: docked directly above the composer, with the question and a close (×) button.
- **Option rows**: a number badge (1, 2, 3…) and a one-line label. The active row has a filled background; dividers separate the rest.
- **Write-in row**: the last number, labelled "Something else". When active, its badge becomes a pencil and the label becomes a text field.
- **Skip**: a small secondary button on the write-in row. It hands the decision back to the agent.
- **Composer**: the normal message field, with its placeholder changed to "Or reply directly…" while a question is open.
- **Keyboard hint**: a quiet line under the composer, "↑ ↓ to navigate · ↵ to select · or type below".

## Behavior
- The card springs in above the composer when the agent asks and folds away when answered. The composer slides up and down with it, so it stays in the same place relative to the card.
- Picking an option answers right away: there is no separate Continue step. Click, Enter on the active row, or the row's number key all work.
- ↑ / ↓ move the active row and wrap around. Hovering a row makes it active, so keyboard and pointer never disagree.
- Moving onto "Something else" focuses its text field. Enter sends what's written; ↑ leaves the field.
- Text sent from the composer while a question is open counts as the answer, so people can explain instead of picking.
- Skip and × are different: Skip tells the agent to decide for itself and go on; × (or Escape) closes the question without an answer, and the host decides whether the run waits or stops.
- The answer is posted to the thread as the person's message (the option label, their text, or "Skipped"), so the conversation keeps a record of the decision.

## Content guidelines
- Ask one question per card, as a direct question ("Which loader should the empty state use?"), not a heading.
- Two to four options. Each label is a complete answer that makes sense on its own in the thread, with the difference up front ("Thinking Loader — shimmer label, no icon").
- Put the likely answer first so Enter does the expected thing.
- Keep the write-in label neutral ("Something else"). Don't mark an option as recommended unless the agent really has a preference, and then say why in the label.

## Accessibility
- The options are a \`role="listbox"\` labelled by the question, with each row a \`role="option"\`. The list keeps focus and points at the active row with \`aria-activedescendant\`, so screen readers announce it as it moves.
- Number keys, arrows, Enter, Space and Escape all work. The focused list shows a visible ring on the active row.
- The write-in field and the composer each have an accessible name. The close button is labelled "Dismiss question".
- The keyboard hint is \`aria-hidden\`: it repeats what the listbox already announces.
- With reduced motion, the card fades in and out instead of springing.

## Related patterns
- **Human in the Loop Question** — Use it instead when the agent needs a short series of answers with a Continue step and a way to go back.
- **Clarifying Questions** — Use it instead before a task starts, to confirm several details at once with pre-filled guesses.
- **Tool Approval** — Use it instead to allow or deny one concrete action with its arguments shown.
- **Message Queue** — Use it as well: it lets people type follow-ups to a busy agent from the same composer.
`;
