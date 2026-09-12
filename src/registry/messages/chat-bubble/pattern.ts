export const pattern = `# Chat Bubble with Actions

## Summary
A conversational message bubble — user or assistant — with an inline action row that reveals on hover/focus: thumbs up/down feedback and Regenerate on assistant replies, Edit (and resubmit) on the user's own messages.

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
  - Assistant: Copy, thumbs up, thumbs down, Regenerate.
  - User: Edit.
- Edit mode: the bubble becomes an editable textarea in place, with Cancel and "Save & submit" controls.

## Behavior
- The action row stays hidden until the bubble (or an action inside it) has hover or keyboard focus — it shouldn't compete with the message content at rest.
- Once feedback is given, the corresponding thumb stays visibly active (a toggle, not a one-shot click) so the state reads even after the row is no longer hovered; clicking the same thumb again clears it.
- Regenerate replaces the assistant message's content in place — it never appends a duplicate reply below it.
- Editing a user message swaps the bubble for a textarea pre-filled with the current text. Enter (without Shift) or "Save & submit" commits it; Escape or Cancel discards the edit and restores the original text.
- Submitting an edited user message is expected to invalidate and regenerate the assistant reply that followed it — this pattern doesn't perform that regeneration itself, but callers should wire the edit-submit handler to a re-send.
- Only one bubble is in edit mode at a time.

## Content guidelines
- Label the commit action "Save & submit" (or equivalent), not just "Save" — it should read as re-sending the message, a bigger consequence than saving a draft.
- Keep the action icons unlabeled visually but always give each a real accessible name — icon-only rows save space but must not go nameless.

## Accessibility
- Every action button needs a descriptive \`aria-label\` ("Good response", "Bad response", "Regenerate", "Edit message") since the icon alone carries no accessible name.
- Thumbs up/down are toggle buttons — expose state with \`aria-pressed\`, not color alone.
- The action row must be reachable by keyboard, not only \`:hover\` — use \`:focus-within\` on the bubble so Tab reveals it.
- The edit textarea should receive focus automatically when edit mode opens, and focus should land somewhere sensible (the bubble, or the next actionable element) when it closes.

## Related patterns
- Pairs with Streaming Text for the assistant reply while it's still generating; this pattern's action row is the equivalent post-stream toolbar for a persisted chat message rather than a one-off streamed answer.
`;
