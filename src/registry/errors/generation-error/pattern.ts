export const pattern = `# Generation Error

## Summary
A message-thread card for a generation that produced no output at all — a network drop, a server failure, a timeout, or a content-safety block. Shows a short human-readable reason, an optional collapsible technical detail (a console-style error line), and a Retry action where retrying makes sense.

## When to use
- The request never produced any content — nothing to preserve, unlike a cut-short stream.
- In the message thread at the position of the failed assistant turn, replacing the loader that was there.
- Whenever a technical error code, request ID, or stack-like detail exists and might help a user reporting the issue — surface it behind "Show details" rather than inline.

## When not to use
- Some content was generated before the failure — use the Partial Response pattern instead so the user doesn't lose it.
- Quota/usage limits — use the Rate Limit pattern; those are expected, recurring states, not failures.
- Validation errors on the user's own input (empty prompt, unsupported file type) — handle inline in the composer, not as a thread message.

## Reasons
Four distinct reasons change the copy and whether Retry is offered:

- **network**: Connection dropped mid-request. Title "Connection lost". Retryable.
- **server**: Upstream failure. Title "Something went wrong". Retryable.
- **timeout**: The model didn't respond in time. Title "Request timed out". Retryable.
- **filtered**: Blocked by content-safety policy. Title "Response blocked". Not retryable — retrying the same prompt will fail the same way; the user needs to change the request instead.

## Anatomy
- Icon: a muted alert glyph, not an alarming red — consistent with this library's other error/limit states.
- Title (bold) + one-line hint, muted.
- Footer row: "Show details" toggle on the left (only rendered when \`errorCode\` is passed), Retry button on the right (only when the reason is retryable and \`onRetry\` is passed).
- Details panel: a monospace, console-style line with the technical error code / request ID, expandable under the footer.

## Behavior
- Details panel animates open/closed by height, collapsed by default.
- Retry enters a disabled "Retrying…" state immediately on tap; the spinner icon rotates. The caller owns the actual re-generation call and clears \`retrying\` when it resolves (success replaces this component; failure re-renders it).
- Non-retryable reasons (\`filtered\`) never show a Retry button even if \`onRetry\` is passed — the caller should instead let the user edit and resend their prompt.
- \`message\` overrides the default hint text per reason, for surfacing a more specific server-provided message without changing the title or retryability.

## Content guidelines
- Titles are short and human: "Connection lost", "Something went wrong", "Request timed out", "Response blocked" — never a raw HTTP status or exception class name in the title.
- The hint is one sentence, plain language, no blame ("Check your connection and try again," not "Your connection failed").
- Technical detail (\`errorCode\`) is the only place raw identifiers belong — request IDs, error codes, stack fragments — and it's opt-in behind "Show details", never shown by default.
- Retry label is always "Retry", not "Try again" or "Regenerate" — keep it distinct from the Partial Response pattern's "Continue"/"Retry" pair.

## Accessibility
- The card has \`role="alert"\` so screen readers announce the failure as it mounts.
- "Show details" uses \`aria-expanded\` reflecting panel state.
- The Retry button's \`aria-label\` switches to "Retrying" while in flight, since the visible label ("Retrying…") pairs with a spinning icon that conveys nothing to assistive tech on its own.
- The alert icon is \`aria-hidden\` — the card's text content, not the icon, carries the meaning.

## Related patterns
- Partial Response — for streams that produced some content before stopping.
- Rate Limit — for quota-exceeded states, which are expected and recurring rather than failures.
`;
