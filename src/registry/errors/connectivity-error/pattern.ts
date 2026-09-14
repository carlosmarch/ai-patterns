export const pattern = `# Connectivity Error

## Summary
A dismissible card that surfaces a network connectivity failure with a short description and two recovery actions — "View details" and "Try again". Appears inline in the layout, not as a toast or modal, and exits with a fade when dismissed or retried.

## When to use
- When the AI product loses its connection to the backend mid-session or on page load, and the user needs to know before submitting another prompt.
- When the error may be caused by VPN, proxy, or local network configuration — not just a transient blip — and the user might need to investigate before retrying.
- When both a passive "View details" path and an immediate "Try again" action are meaningful.

## When not to use
- Brief transient failures that auto-recover within seconds — surface a spinner instead and only show this if recovery fails after a threshold.
- Hard authentication or quota failures — use a more specific error pattern (Rate Limit, account error) rather than a generic connectivity card.
- When there is no meaningful "View details" target — omit that action rather than linking to a dead end.

## Anatomy
- **Icon**: \`WifiOff\` (or similar offline icon) at 16px, next to the title. Decorative — \`aria-hidden\`.
- **Title**: Short, factual label ("Connection lost"). Medium-bold, text-foreground.
- **Close button**: Icon-only × button at the top-right, hidden if \`onClose\` is not provided.
- **Description**: One sentence explaining what may have caused the issue and what the user can do. Muted text.
- **View details button**: Secondary bordered button, left-aligned in the footer row. Omitted if \`onViewDetails\` is not provided.
- **Try again button**: Secondary bordered button, right-aligned in the footer row. Omitted if \`onRetry\` is not provided.

## Behavior
- Mounts with a short upward fade (opacity 0→1, y −6→0, 200 ms ease-out).
- Exits with the reverse animation when the close button is clicked.
- Pressing "Try again" should trigger the parent's retry logic; the demo resets the key so the card reappears after it has been dismissed.
- Internal \`visible\` state gates the \`AnimatePresence\` exit — callers control re-showing by re-mounting (key reset) or by not providing \`onClose\`.
- The card does not auto-dismiss or countdown — the user must act.

## Content guidelines
- Title: plain noun phrase describing the state, not an error code. "Connection lost" not "ERR_NETWORK_CHANGED" or "Request failed (503)".
- Description: one sentence, action-oriented. Lead with what to check, not what went wrong. "Check your internet connection, VPN or proxy and try again."
- "Try again" is always the primary recovery; "View details" is optional and should link to a diagnostic panel or log, not an alert.
- Keep both button labels under 20 characters — they share a single row.

## Accessibility
- The container has \`role="alert"\` and \`aria-live="assertive"\` so screen readers announce it immediately on mount.
- The close button has \`aria-label="Close"\`.
- The wifi-off icon is \`aria-hidden\` — the title carries the semantic meaning.

## Related patterns
- Rate Limit — for quota-exceeded states, not connectivity failures.
- Partial Response — for responses cut short by the server, not by a network drop.
- Console Error Card — for surfacing developer-facing browser errors, not end-user connectivity issues.
`;
