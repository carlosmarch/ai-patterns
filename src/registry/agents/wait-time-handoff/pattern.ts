export const pattern = `# Wait Time Handoff

## Summary
A collapsible settings card that decides what an AI agent does when the customer stops replying. The builder sets a wait duration, chooses whether an unanswered conversation goes to a **Team** or a **Workflow**, picks the specific target, writes the message the customer sees at handoff, and optionally limits the timer to working hours. A one-line summary restates the rule in plain language so the configuration can be checked at a glance.

## When to use
- Configuring a support or sales agent that asks the customer something and must not leave the conversation open forever if they go quiet.
- When there is more than one sensible fallback — route to people (a team inbox) or to automation (a follow-up, survey, or close-out workflow).
- As one section inside a larger agent or procedure settings page, where it can collapse to its summary.

## When not to use
- Timeouts the end user controls (a session expiry, an upload timeout) — this is an operator-facing configuration, not a runtime prompt.
- When the only outcome is "close the conversation" — a single duration field is enough; the Team/Workflow switch adds noise.
- Complex inactivity logic with multiple reminders or escalation tiers — use a workflow or procedure builder where the steps are explicit.

## Anatomy
- Header: timer icon, "Wait time" title, and a chevron that collapses the card. Collapsed, it shows a summary ("1 minute → Request further information").
- Duration row: a compact numeric input and a unit select (seconds, minutes, hours), under the helper "Set how long [agent] waits for a response."
- Handoff label: "If there's no response, hand off to:".
- Segmented control with two options, Team and Workflow, each with an icon; the selected segment is a raised pill.
- Target select: the list changes with the segment — team inboxes or saved workflows.
- Handoff message: a textarea prefilled with the target's default copy.
- Working-hours checkbox with a helper line explaining what customers see outside hours.
- Live summary footer: "[Agent] waits **1 minute**, then hands off to **Request further information**."

## Behavior
- The duration is clamped on blur or Enter to a sane range per unit (1–59 seconds or minutes, 1–72 hours); switching unit re-clamps the current value instead of rejecting it.
- Switching between Team and Workflow slides the selection pill across (spring, ~200 ms) and swaps the target select with a short fade, selecting the first option of the new list.
- Choosing a target replaces the message with that target's default copy — but only until the builder edits the message. Once edited, their text is never overwritten by further target changes.
- With "working hours only" on, the timer pauses outside working hours and the summary reads "1 minute of working hours".
- The chevron rotates and the body collapses with a height + opacity transition; the collapsed header keeps the summary visible so the section is never a black box.
- Every change emits the full value object (\`amount\`, \`unit\`, \`kind\`, \`targetId\`, \`message\`, \`workingHoursOnly\`) so the parent can save or validate it.

## Content guidelines
- Name the agent in the helper ("Set how long Fin waits…") so it is clear whose patience is being configured.
- Phrase the handoff label as the condition, not the action: "If there's no response, hand off to:".
- Default messages should tell the customer what happens next, in one sentence, without blaming them for going quiet: "We'll need to collect some more information to process this request."
- Name workflows by outcome ("Request further information", "Send CSAT survey"), and teams by who they are ("Billing"), so the summary reads as a sentence.
- Keep the summary literal — duration, condition, destination — no marketing copy.

## Accessibility
- The header is a heading containing a disclosure \`button\` with \`aria-expanded\` and \`aria-controls\` pointing at the body region.
- Duration and handoff groups are \`fieldset\`s whose \`legend\` is the visible helper text; the number input and unit select have their own accessible names.
- The Team/Workflow switch is a \`radiogroup\` of \`radio\` buttons with roving \`tabIndex\`; Arrow keys move and select, matching native radio behavior. Icons are \`aria-hidden\`.
- Selects are native \`<select>\` elements styled as pills, so they keep platform keyboard and screen-reader behavior.
- The checkbox's helper text is linked with \`aria-describedby\`. The summary footer is \`aria-live="polite"\` so changes are announced without stealing focus.
- Motion is limited to short opacity / position transitions; honor \`prefers-reduced-motion\` by disabling the pill slide and height animation.

## Related patterns
- Procedure Builder — where the workflows this card hands off to are authored.
- Agent Triggers — decides when an agent starts; Wait Time Handoff decides when it gives up.
- Human in the Loop Question — the question the agent is often waiting on an answer to.
`;
