export const pattern = `# Chat Bubble with Actions

## Summary
A conversational message bubble — user or assistant — with an inline action row that reveals on hover/focus: Copy, thumbs up/down feedback, and Regenerate on assistant replies; Retry, Edit (and resubmit), and Copy on the user's own messages. When a message has more than one version — from an edit or a retry/regenerate — a version stepper ("2/2" with prev/next arrows) appears at the end of the row so people can page through history without losing it.

## When to use
- Any chat-style conversation UI where actions belong to a single message, not a global toolbar.
- Assistant replies that benefit from an explicit quality signal (thumbs) or a one-click retry when the first answer misses.
- User messages the person may want to correct or refine after seeing the reply (a typo, an added detail, a different phrasing) without retyping the whole conversation.
- Conversations where regenerating or editing produces multiple candidate replies/prompts worth keeping around instead of discarding — the version stepper lets people compare them without duplicating bubbles on screen.

## When not to use
- Read-only transcripts (chat history exports, shared/public views) where no one should be able to edit or regenerate.
- Broadcast or group messages, where "edit and resubmit" would silently change what other participants already saw — reserve it for single-user assistant conversations, where resubmitting is understood to fork the conversation rather than rewrite history for everyone.
- Very short-lived, ephemeral UI (toasts, system notices) — the action row adds visual weight that isn't earned there.

## Anatomy
- Message bubble: role-differentiated style (e.g. user bubble filled/right-aligned, assistant bubble muted/left-aligned).
- Action row, below the bubble, revealed on hover/focus:
  - User: Retry, Edit, Copy.
  - Assistant: Copy, thumbs up, thumbs down, Regenerate.
  - Version stepper (optional, trailing): a vertical divider, a previous-version chevron, an "n/total" counter, a next-version chevron — shown only when the message has more than one version.
- Edit mode: the bubble becomes an editable textarea in place, with Cancel and "Save & submit" controls.

## Behavior
- The action row stays hidden until the bubble (or an action inside it) has hover or keyboard focus — it shouldn't compete with the message content at rest.
- Once feedback is given, the corresponding thumb stays visibly active (a toggle, not a one-shot click) so the state reads even after the row is no longer hovered; clicking the same thumb again clears it.
- Retry (user) and Regenerate (assistant) both resend the current user message and produce a new reply. Wire them to the same re-send handler — retrying from the user bubble is equivalent to regenerating from the assistant bubble that follows it.
- Regenerating/retrying never overwrites history in place — it adds a new version and moves the stepper to it, so earlier attempts stay reachable via the prev arrow.
- Editing a user message swaps the bubble for a textarea pre-filled with the current text. Enter (without Shift) or "Save & submit" commits it; Escape or Cancel discards the edit and restores the original text.
- Submitting an edited user message is expected to invalidate and regenerate the assistant reply that followed it — this pattern doesn't perform that regeneration itself, but callers should wire the edit-submit handler to a re-send that also creates a new version.
- Only one bubble is in edit mode at a time.
- The version stepper is only rendered when there's more than one version (\`versionCount > 1\`) — a message with a single version shows no stepper at all, not a disabled "1/1".
- Navigating the stepper on either the user or assistant bubble in a pair should move both in lockstep, since a version represents one full turn (the prompt and the reply it produced), not two independently versioned halves.
- The prev/next arrows disable at the ends of the version range instead of wrapping.

## Content guidelines
- Label the commit action "Save & submit" (or equivalent), not just "Save" — it should read as re-sending the message, a bigger consequence than saving a draft.
- Keep the action icons unlabeled visually but always give each a real accessible name — icon-only rows save space but must not go nameless.
- Keep the version counter numeric and terse ("2/2"); it's a position indicator, not a label — don't spell out "Version 2 of 2" inline.

## Accessibility
- Every action button needs a descriptive \`aria-label\` ("Good response", "Bad response", "Regenerate", "Retry", "Edit message", "Copy", "Previous version", "Next version") since the icon alone carries no accessible name.
- Thumbs up/down are toggle buttons — expose state with \`aria-pressed\`, not color alone.
- The action row must be reachable by keyboard, not only \`:hover\` — use \`:focus-within\` on the bubble so Tab reveals it.
- Disabled stepper arrows (at the first/last version) must be real \`disabled\` buttons, not just dimmed, so assistive tech and keyboard users don't land on a dead control.
- The edit textarea should receive focus automatically when edit mode opens, and focus should land somewhere sensible (the bubble, or the next actionable element) when it closes.

## Related patterns
- Pairs with Streaming Text for the assistant reply while it's still generating; this pattern's action row is the equivalent post-stream toolbar for a persisted chat message rather than a one-off streamed answer.
- For a voice-composed message, show a Live Transcript while the person is still speaking, then hand the finalized text off into a user bubble once the turn ends — don't run the transcript's interim/final styling inside the bubble itself.
`;
