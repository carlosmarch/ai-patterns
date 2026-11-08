export const pattern = `# Rejected Prompt Restore

## Summary
When an agent declines the first prompt of a session — out of scope, not allowed, missing access — the person gets their words back. No empty or failed session is left behind: the prompt returns to the composer, the agent's reason sits right above it, and editing and resending is the obvious next step.

## When to use
- Agents check a request before starting (permissions, workspace scope, policy, missing connectors) and can refuse it outright.
- Prompts are long and specific, so retyping one is a real cost.
- The refusal has a reason the person can act on: remove a part, narrow the scope, grant access.

## When not to use
- The agent started and failed partway. That is a failed run, not a rejected prompt; use **Generation Error** or **Partial Response**.
- The reply is generated but blocked afterwards by a filter. Show the blocked state on the reply; there's nothing to restore.
- The problem is ambiguity, not refusal. Ask instead with **Clarifying Questions** so the work can start.
- Later turns in a running session. Keep the conversation and answer in it; the prompt doesn't need restoring.

## Anatomy
- Reason card: above the composer, a short title ("The agent didn't start this task"), the reason in one sentence, an optional suggestion, a hint that the prompt is back below, and Dismiss.
- Composer: holds the restored text exactly as sent, cursor at the end, with a subtle highlight until it's edited.
- Send again: the ordinary send button, renamed for assistive tech while a rejection is showing.

## Behavior
- On rejection, put the exact text back in the composer and move focus there, cursor at the end. Attachments and chips sent with it come back too.
- Don't create a session, a title or a history entry for a prompt that never started.
- The reason card stays while the person edits, and its hint changes once the text differs from what was rejected ("Edited — send when ready.").
- Sending again runs the normal check. If it passes, the card goes away and the session starts; if it fails again, the card updates with the new reason.
- Dismiss hides the card but keeps the text; the person decides whether to keep or clear it.
- If several prompts are rejected in a row for the same reason, say what would work instead rather than repeating the same line.

## Content guidelines
- The reason names the rule and the thing: "It can only change files inside this project, and ~/Downloads is outside it." Not "Request not permitted."
- Give a way forward when there is one: "Remove that part, or open ~/Downloads as its own project."
- Don't apologise or moralise, and don't guess at intent. State the limit.
- Keep the title neutral and consistent: "The agent didn't start this task".

## Accessibility
- The reason card is a \`role="alert"\` region, so the rejection is announced when it appears.
- The composer is linked to the reason with \`aria-describedby\` while it shows, so the reason is read when focus returns to the input.
- Focus moves into the composer with the cursor at the end of the restored text; nothing is selected, so typing doesn't replace it.
- Dismiss and Send again have text labels for screen readers. The card fades instead of sliding under \`prefers-reduced-motion\`.

## Related patterns
- **Generation Error** — Use it instead when the agent started and the run failed.
- **Clarifying Questions** — Use it instead when the prompt is unclear rather than refused.
- **Checkpoint Restore** — Use it for a later turn: rewinding the conversation also hands the prompt back for editing.
- **Prompt Enhancer** — Use it as well to suggest a rewrite of the restored prompt that the agent will accept.
`;
