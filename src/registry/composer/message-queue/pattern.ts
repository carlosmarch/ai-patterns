export const pattern = `# Message Queue

## Summary
A composer that stays usable while the agent is working. Enter still sends right away, but ⌘Enter (Ctrl+Enter elsewhere) parks the message in a queue stacked above the input. Each queued message can be sent now, pulled back to edit, or removed — and when the current turn finishes, the oldest one goes out automatically. Users keep thinking ahead instead of waiting for the agent to finish.

## When to use
- Agentic products where turns run for seconds or minutes (coding agents, research, multi-step tool use) and users already know their next instruction.
- When interrupting the running turn is costly or risky, so "send it after this" needs to be a distinct, safer choice than "send it now".

## When not to use
- Fast, single-shot chat where responses land in a second or two — the queue would never be visible long enough to matter.
- When the next message depends on reading the current answer first; a queue only helps when the follow-up is already known.
- Products that can't actually defer a message — never show a queue the backend won't honor in order.

## Anatomy
- Composer: input, send button (morphs to Stop while busy and empty), and a "Queue ⌘↵" button that appears while busy and there's a draft.
- Placeholder hint while busy: "↵ to send, ⌘↵ to queue" — teaches the shortcut exactly when it applies.
- Queue stack: one muted row per queued message, above the composer, oldest first. The first row carries the count ("2 queued"); each row shows a truncated preview.
- Row actions: Send now (return arrow), Edit (pencil), Remove (×).

## Behavior
- Idle: Enter sends; ⌘Enter behaves like Enter (there's nothing to queue behind).
- Busy: Enter sends immediately — the host decides whether that steers or interrupts the current turn. ⌘Enter appends the draft to the queue and clears the input.
- When a turn ends, the oldest queued message is sent automatically and marked as coming from the queue; the rest wait for the next turn to finish. Stopping the turn also releases the queue.
- Send now removes the row and sends it immediately, skipping the line.
- Edit pulls the message back into the composer for changes. If the user had an unsent draft, the draft takes the edited message's slot so nothing typed is lost.
- ↑ on an empty composer recalls the last queued message for editing, mirroring shell history.
- Rows slide in from the composer when queued and lift away when sent or removed; the stack reflows with layout animation.

## Content guidelines
- Name the state plainly: "Queued", "2 queued". Avoid "pending", which reads like a sending failure.
- Show the shortcut as glyphs (⌘↵, Ctrl↵) matched to the user's platform, never both.
- Previews are one line, truncated; the full text is available on hover and via Edit.

## Accessibility
- The queue is a list labeled "Queued messages"; every row action is a real button with an \`aria-label\` and a tooltip.
- A polite live region announces the queue count when it changes, so screen-reader users know a message was parked rather than sent.
- The input exposes its shortcuts via \`aria-keyshortcuts\`, and the visible "Queue" button gives pointer and touch users the same action without the chord.
- Edit and Remove return focus to the composer.
- Respect \`prefers-reduced-motion\`: rows fade instead of sliding and reflowing.

## Related patterns
- Stop Generation Button — the send/stop control the composer reuses while busy.
- Prompt Bar — the base composer this extends.
- Task List — shows the agent's own plan; the queue holds the user's next instructions.
`;
