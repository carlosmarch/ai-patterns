export const pattern = `# Terminal Stream

## Summary
An auto-scrolling, collapsible panel that streams a command's raw output line by line, tinted by level (info, warning, error, success) — the closest thing in the catalogue to a real terminal, for when the full, unstructured output of a running process is worth showing.

## When to use
- An agent or tool is executing a shell command, build, test run, or deploy, and its raw output has real value beyond "it succeeded" (debugging a failure, watching a long build).
- The user should be able to collapse it out of the way once they trust it's just noise, without losing the output entirely.

## When not to use
- For a single tool call's status with no meaningful line-by-line output — use a Tool Call Chip instead.
- For output that's actually structured data (a diff, a table, a list of files) — render it as that shape (e.g. Diff Summary) rather than flattening it into log lines.
- As a permanent, always-expanded fixture once the command is long done — let it collapse to a compact header so it doesn't dominate the surrounding content.

## Anatomy
- Header bar: a terminal icon, the command itself (monospace), a status indicator (running / done / error), a line count, and a collapse toggle.
- Log body: monospace lines, each tinted by level — default, info, warning, error, success.
- A blinking cursor at the tail while still streaming.
- A "Jump to latest" pill that appears only when the user has scrolled away from the bottom during an active stream.

## Behavior
- New lines append at the bottom and the panel auto-scrolls to keep the latest line in view, as long as the user hasn't manually scrolled up.
- Scrolling up during an active stream pauses auto-scroll and reveals "Jump to latest"; clicking it snaps back to the bottom and resumes auto-scroll.
- Collapsing hides the log body but keeps the header — including a live line count and status — visible; output keeps accumulating in the background while collapsed.
- On completion, the header's status swaps to done or error; the log itself is never cleared or replaced, so scrollback stays available.

## Content guidelines
- Tint lines by their actual level — don't invent color meaning for lines that are all the same kind of output.
- The header shows the literal command, not a paraphrase or summary of what it does.

## Accessibility
- The log region is a live region only while actively streaming and expanded (\`aria-live="polite"\`) — throttle or batch announcements for high-volume output rather than announcing every line.
- The collapse toggle exposes \`aria-expanded\`.
- The log body is a real scrollable, focusable region reachable and operable by keyboard, not just by mouse drag.
- Status is conveyed by icon and text together, never color alone.

## Related patterns
- Tool Call Chip is the compact, single-call counterpart — reach for this pattern once that call's full output actually matters.
- Diff Summary is the finished-state counterpart specifically for file-edit output, once raw log lines aren't the right shape anymore.
`;
