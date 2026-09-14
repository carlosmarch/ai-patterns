export const pattern = `# Rate Limit

## Summary
A dismissible horizontal banner that warns the user their usage is approaching or has reached a quota limit. Shows a label, an optional reset time or live countdown, an upgrade CTA, and a dismiss control — all in a single compact row.

## When to use
- When the user is approaching or has hit a per-day, per-week, or per-month message quota.
- As a non-blocking notice inline in the UI — not a modal, not a toast, not a full page. The user should be able to read it and continue working (or dismiss it).
- When a reset time is known (either a specific clock time or a duration), always show it — it transforms a hard stop into a temporary state.

## When not to use
- Transient server errors or network failures — use the Generation Error pattern instead.
- Hard blocks where the user truly cannot proceed (account suspended, payment failed) — those warrant a modal or full-page state, not a dismissible banner.
- Per-request throttling (HTTP 429 with immediate retry-after < 60s) — show a brief inline message rather than a persistent banner.

## Anatomy
- **Pulsing signal icon**: concentric arcs around a center dot, with a subtle ping animation. Communicates "signal / broadcast / status" — not an error icon, not an alarm.
- **Label**: the usage limit message in medium-weight text. Should describe what limit was hit, not the raw technical limit.
- **Reset label**: muted text, inline with the label. Either a static clock time ("Resets at 18:00") or a live MM:SS countdown ("Resets in 4:23").
- **Upgrade CTA**: a bordered pill button with a short action label. Only shown when \`onUpgrade\` is provided.
- **Dismiss (×)**: icon-only button at the far right. Removes the banner with an exit animation.

## Behavior
- Enters with a short downward fade (opacity 0→1, y -6→0, 200ms ease-out).
- Exits with the reverse when dismissed.
- Countdown mode: a \`setInterval\` ticking every second drives the MM:SS display. The interval stops at 0 to avoid unnecessary renders. Callers are responsible for restoring access when the timer expires — this component does not re-enable the composer automatically.
- Static mode: \`resetTime\` is a pre-formatted string ("18:00"); the component renders it as-is.
- Dismissing via the × fires \`onDismiss\` and hides the component. Callers decide whether to re-show it (e.g. on next page load or after a threshold is crossed again).

## Reset label variants
- **\`resetTime\` (string)**: Pass a pre-formatted clock time. Use for quota resets tied to a known wall-clock time ("Resets at 18:00", "Resets at midnight").
- **\`resetAt\` (Date)**: Pass a future timestamp. The component derives a live countdown ("Resets in 4:23"). Use when the API returns an exact reset timestamp.
- If both are provided, \`resetAt\` takes precedence (live countdown is more informative).
- If neither is provided, no reset label is shown.

## Content guidelines
- Label: describe the limit in human terms, not API terms. "Approaching weekly usage limit" not "429 Too Many Requests" or "Rate limit: 10/10 used".
- Never show the raw numeric quota ("You've used 10 of 10 messages") — it frames the product negatively.
- Upgrade label: "Get more usage" or "Upgrade" — short, benefit-framed, not "Buy now" or "Go Pro".
- Reset label: "Resets at [time]" or "Resets in [MM:SS]" — consistent preposition, no parentheses.

## Accessibility
- The container has \`role="status"\` and \`aria-live="polite"\` so screen readers announce it when it appears without interrupting the user.
- The countdown span has an \`aria-label\` with the human-readable form ("Resets in 4 minutes 23 seconds") — screen readers don't read "4:23" legibly.
- The dismiss button has \`aria-label="Dismiss"\`.
- The pulsing icon is \`aria-hidden\` — it is decorative.
- Countdown ticks should NOT be in a live region themselves — announcing every second would be disruptive. The initial announcement of the full banner is sufficient.

## Related patterns
- Generation Error — for individual response failures, not quota states.
- Partial Response — for responses cut short by token limits rather than user quotas.
`;
