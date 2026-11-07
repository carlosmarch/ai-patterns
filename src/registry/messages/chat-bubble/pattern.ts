export const pattern = `# Chat Bubble with Actions

## Summary
A conversational message bubble — user or assistant — with an inline action row that reveals on hover/focus: Copy, thumbs up/down feedback, and Regenerate on assistant replies; Retry, Edit (and resubmit), and Copy on the user's own messages. When a message has more than one version — from an edit or a retry/regenerate — the row ends in a version stepper; how those versions behave is defined by Conversation Branches.

## When to use
- Any chat-style conversation UI where actions belong to a single message, not a global toolbar.
- Assistant replies that benefit from an explicit quality signal (thumbs) or a one-click retry when the first answer misses.
- User messages the person may want to correct or refine after seeing the reply (a typo, an added detail, a different phrasing) without retyping the whole conversation.

## When not to use
- Read-only transcripts (chat history exports, shared/public views) where no one should be able to edit or regenerate.
- Broadcast or group messages, where "edit and resubmit" would silently change what other participants already saw — reserve it for single-user assistant conversations, where resubmitting is understood to fork the conversation rather than rewrite history for everyone.
- Very short-lived, ephemeral UI (toasts, system notices) — the action row adds visual weight that isn't earned there.

## Anatomy
- Message bubble: role-differentiated style (e.g. user bubble filled/right-aligned, assistant bubble muted/left-aligned).
- Action row, below the bubble, revealed on hover/focus:
  - User: Retry, Edit, Copy.
  - Assistant: Copy, thumbs up, thumbs down, Regenerate.
  - Version stepper (optional, trailing): a vertical divider, then the previous / counter / next switcher from Conversation Branches.
- Edit mode: the bubble becomes an editable textarea in place, with Cancel and "Save & submit" controls.

## Behavior
- The action row stays hidden until the bubble (or an action inside it) has hover or keyboard focus — it shouldn't compete with the message content at rest.
- Once feedback is given, the corresponding thumb stays visibly active (a toggle, not a one-shot click) so the state reads even after the row is no longer hovered; clicking the same thumb again clears it.
- Retry (user) and Regenerate (assistant) both resend the current user message and produce a new reply. Wire them to the same re-send handler — retrying from the user bubble is equivalent to regenerating from the assistant bubble that follows it.
- Retry, Regenerate and "Save & submit" never overwrite history: each adds a version and shows it. Versioning — what a version contains, how switching moves the reply and the rest of the thread with it, the counter and its disabled ends — follows Conversation Branches.
- Editing a user message swaps the bubble for a textarea pre-filled with the current text. Enter (without Shift) or "Save & submit" commits it; Escape or Cancel discards the edit and restores the original text.
- This component doesn't generate replies itself: wire edit-submit, Retry and Regenerate to a re-send that creates the new version.
- Only one bubble is in edit mode at a time.
- The stepper is only rendered when there's more than one version (\`versionCount > 1\`) — a single version shows no stepper, not a disabled "1/1".

## Content guidelines
- Label the commit action "Save & submit" (or equivalent), not just "Save" — it should read as re-sending the message, a bigger consequence than saving a draft.
- Keep the action icons unlabeled visually but always give each a real accessible name — icon-only rows save space but must not go nameless.

## Accessibility
- Every action button needs a descriptive \`aria-label\` ("Good response", "Bad response", "Regenerate", "Retry", "Edit message", "Copy"); the stepper's names come from Conversation Branches since the icon alone carries no accessible name.
- Thumbs up/down are toggle buttons — expose state with \`aria-pressed\`, not color alone.
- The action row must be reachable by keyboard, not only \`:hover\` — use \`:focus-within\` on the bubble so Tab reveals it.
- The edit textarea should receive focus automatically when edit mode opens, and focus should land somewhere sensible (the bubble, or the next actionable element) when it closes.

## Related patterns
- **Streaming Text** — Use it as well while the assistant reply is still generating, then show this bubble's actions once it's done.
- **Live Transcript** — Use it before this one for a voice-composed message, and hand the final text into a user bubble when the turn ends.
- **Conversation Branches** — Use it as well; it defines how the versions behind this bubble's stepper work, and the stepper follows it.
- **Selection Actions** — Use it instead when the action applies to part of a message rather than the whole thing.
`;
