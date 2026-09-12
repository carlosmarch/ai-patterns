export const pattern = `# Stop Generation Button

## Summary
A composer's send control that morphs into a Stop button the instant generation begins, then morphs back the instant it ends — the same control across all three states (idle, generating, done) so the user's hand never has to find a different button to interrupt a response.

## When to use
- Any composer whose output streams over a real window of time (an LLM response, a long-running job) where the user may want to interrupt it mid-flight.
- As the one control that owns both "start" and "stop" for a single turn — never a second, separately-positioned cancel button.

## When not to use
- For actions that can't actually be interrupted — never show a Stop control that doesn't stop anything real; that's worse than no control at all.
- For near-instant responses with no meaningful in-flight window — the morph would flash and add noise instead of giving the user a real chance to act.

## Anatomy
- A single circular (or pill) icon button.
- Idle state: a send/arrow icon, disabled when the input is empty.
- Generating state: a solid stop-square icon, always enabled.
- The shape morphs between states with motion — not an abrupt icon swap — so it reads as the same control changing purpose, not a different button appearing.

## Behavior
- Clicking while idle (with input present) submits immediately and the button morphs to Stop before the first token of the response arrives — the transition is optimistic, not waiting on a server round-trip.
- Clicking while generating cancels the stream and the button morphs back to idle immediately, without an intermediate loading state on the click itself.
- Disabled only in the idle state with empty input; always interactive while generating, since stopping should never be blocked.
- The morph plays every transition, including generating → idle on natural completion, so a finished response and a user-cancelled one both land back on the same recognizable send affordance.

## Content guidelines
- Icon-only is standard; if a label is shown alongside, it swaps in lockstep with the icon ("Send" / "Stop") rather than staying static.

## Accessibility
- \`aria-label\` updates with state ("Send message" / "Stop generating") so assistive tech announces the button's current purpose, not just its icon.
- Remains a real, focusable, keyboard-operable button (Enter/Space) in every state.
- Disabled state uses the \`disabled\` attribute, not opacity alone, so it's programmatically detectable.

## Related patterns
- Thinking Loader is the passive "still working" indicator that typically appears alongside this button — this control is what lets the user act on that same in-progress window.
`;
