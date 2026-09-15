export const pattern = `# Human in the Loop Question

## Summary
A compact dialog that pauses an agent mid-task to collect a structured choice from the user — a set of radio options, an optional free-text fallback, and skip/continue controls. When more than one question is needed, a step counter opens a dropdown list so the user can see what's coming and jump between questions. Once all questions are answered the dialog resolves into a compact confirmation row and the agent proceeds.

## When to use
- The agent has reached a decision point where the output depends on a preference only the user can supply (a strategy choice, a scope decision, a threshold).
- The agent needs input before taking an action that is hard to reverse or would require significant rework if the wrong assumption is made.
- You want to front-load a short sequence of configuration questions at the start of a long autonomous run, so the agent can work uninterrupted afterward.

## When not to use
- For binary yes/no confirmation of a specific pending action — use Tool Approval, which is purpose-built for that pattern and carries the literal call details the user needs to see.
- When the agent can make a safe, recoverable assumption and ask forgiveness rather than permission — unnecessary interruptions erode trust in the agent.
- For long or complex surveys; cap the sequence at three to five questions. If more input is required, break the task into distinct phases with a planning step first.
- As a substitute for proper onboarding; don't use this pattern to collect user preferences that should have been gathered during setup.

## Anatomy
- **Question header**: the question text and an optional close/dismiss button.
- **Option list**: radio-style buttons; each shows a filled circle when selected. Label text shifts from muted to full contrast on selection.
- **Free-text fallback** (optional): an inline text input that acts as a write-in option; selecting it deselects the preset options.
- **Step indicator**: a \`n/total\` counter with a chevron that opens a step-list dropdown; answered steps show a filled checkmark, the current step is highlighted, future steps are dimmed.
- **Action row**: Skip (ghost) and Continue (primary blue); Continue is disabled until a choice is made.
- **Resolved state**: after the final question, the dialog transitions to a single confirmation row ("Got it — continuing the task.").

## Behavior
- Clicking Continue advances to the next question with a short fade-slide transition, or submits on the final step.
- Clicking Skip advances without recording an answer; the agent uses a default for that question.
- The step-list dropdown lets the user jump back to any question and change their answer before submitting.
- The free-text input captures focus and activates as the selected option; its radio indicator fills when the field has content.
- The dialog entry animates in (fade + slide up) so it feels like an insertion in the flow rather than a blocking overlay.
- After submit, the dialog transitions to the resolved state and is replaced after a short delay by the agent's next output.

## Guardrails
- The Continue button must remain disabled until the user has made a selection — either a preset option or a free-text entry with at least one character. Never auto-advance on selection without an explicit tap.
- Skip must never silently drop a question that the agent requires to proceed. If a question is mandatory, remove Skip and show a hint explaining why an answer is needed.
- Cap the sequence at five questions. Beyond that, the interruption feels like a form rather than a clarification and should be replaced by a dedicated settings or planning step.
- Do not show this pattern for decisions the agent can safely reverse or re-ask later. Reserve it for choices that meaningfully fork the agent's path or whose cost to undo is high.
- Never pre-select an option on the user's behalf. A pre-selected radio implies a default; if a default is acceptable, document it in the agent's behavior and skip the question entirely.
- The free-text fallback must not be the only option. It signals "none of the above" — if every question needs an open answer, a chat prompt is more appropriate than this pattern.

## Content guidelines
- Questions should be concrete decision points, not open-ended prompts ("Which model should handle reasoning tasks?" not "What do you prefer?").
- Option labels should be short noun phrases or brief imperatives (five words or fewer); avoid starting with a verb that duplicates the question's verb.
- The free-text placeholder should be the literal string "Something else..." — this signals write-in without over-explaining.
- Skip implies the agent has a sensible default; don't show it if skipping the question would leave the agent in an undefined state.
- Keep the entire sequence to three questions or fewer when possible; if the sequence must be longer, show a progress indicator.

## Accessibility
- Each option must be a real \`<button>\` element — not a styled \`<div>\` — so it's reachable and activatable by keyboard.
- The step-list dropdown uses \`aria-haspopup\` and \`aria-expanded\` on its trigger, and closes on Escape or an outside click.
- Continue's \`disabled\` state must be communicated beyond color alone — the button text remains legible and the label unchanged.
- The free-text input must have a visible label or an \`aria-label\`; the placeholder alone is not sufficient for accessibility.
- Avoid auto-advancing on radio selection without an explicit Continue click — screen readers and keyboard users need a stable target.

## Related patterns
- **Tool Approval** handles the narrower case of approving or denying a specific pending tool call; Human in the Loop handles open-ended preference collection.
- **Create Agent** is a broader wizard pattern for structured multi-field setup; use it when the questions involve text fields, toggles, and pickers rather than single-choice options.
`;
