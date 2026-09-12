export const pattern = `# Partial Response

## Summary
A message component for responses that ended before completion. Displays whatever text was generated, clearly marks it as incomplete, and offers Continue (resume from the cut-off point) and Retry (regenerate from scratch) actions.

## When to use
- The stream ended before a natural conclusion — stopped by the user, cut off by an output token limit, or dropped by a transient error — and some content was produced.
- Any time preserving and resuming the partial output is preferable to discarding it. A partial response with continuation is nearly always more useful than a blank error card.
- In the message thread at the position of the incomplete assistant turn, not as a modal or a separate panel.

## When not to use
- Zero content produced — if the response never started, use the Generation Error pattern instead.
- The content is corrupted or nonsensical (e.g. a mid-token cut-off in a code block) — in this case retry is the better default action; hide Continue.
- Read-only transcript views where resuming is not an option.

## Reasons
Three distinct reasons change the copy and available actions:

- **interrupted**: User clicked Stop. Label "Stopped". Both Continue and Retry are available.
- **max-tokens**: Hit the model's output token ceiling. Label "Cut off". Both Continue (model continues from the cut-off) and Retry are available.
- **error**: Transient error mid-stream. Label "Incomplete". Only Retry is available — continuing from an error state may reproduce the error.

## Anatomy
- Content area: the partial text, rendered as-is, with a blinking cursor appended to signal incompleteness.
- Status bar: a hairline-bordered footer row.
  - Left: reason label (bold) + separator + one-line hint in muted text.
  - Right: Retry button (ghost, muted) and Continue button (filled, primary). Continue is the primary action.
- Blinking cursor: a narrow vertical bar animating opacity 1→0 on a 0.8s loop. Hidden with \`aria-hidden\`.

## Behavior
- The cursor blinks continuously at rest to keep the "mid-stream" sense alive even after the stream stopped.
- Tapping Continue puts the button into "Continuing…" disabled state immediately; the caller owns the actual resumption request and passes \`resuming={true}\` back.
- Resumption semantics (sending the prior context + the partial response as the new prompt) are the caller's responsibility. This component signals intent; it does not issue API calls.
- Tapping Retry discards the partial content and issues a fresh generation from the original prompt. The caller handles this by removing the partial message and resubmitting.
- Only one action may be in-flight at a time (Continue disables during \`resuming\`). Retry does not need a loading state if the caller immediately replaces this component with a new streaming response.

## Content guidelines
- Reason labels: "Stopped", "Cut off", "Incomplete" — short, factual, no punctuation.
- Hint text: one sentence, no more. "Response was stopped before it finished." / "Response reached the output limit." / "Response stopped due to an error."
- Continue label: "Continue" with a › chevron — implies the stream will pick up from here, not start over.
- Retry label: "Retry" — unambiguous, separate from Continue.
- Never expose the token count or technical limit to the user ("stopped at 4096 tokens").

## Accessibility
- The blinking cursor has \`aria-hidden\` — it is a decorative animation.
- Continue button \`aria-label\` changes to "Resuming response" when \`resuming\` is true, giving screen-reader users feedback without a visible spinner.
- The status bar text is available to assistive technology as static text; no additional live region is needed since the component appears fully rendered.
- Keyboard: both actions are reachable via Tab; Continue is the last focused element in the component (rightmost in the footer), matching its primary-action status.

## Related patterns
- Generation Error — for requests that produced no output at all.
- Rate Limit — for quota-exceeded states where the user must wait before retrying.
- Stop Generation Button — the control that triggers the "interrupted" reason for this pattern.
- Streaming Text — the in-progress version of this component, before the stream ends.
`;
