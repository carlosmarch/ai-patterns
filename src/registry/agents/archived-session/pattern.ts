export const pattern = `# Archived Session

## Summary
An archived agent session stays readable but can't take new messages. Instead of a disabled composer or a dead end, a muted banner takes the composer's place. It says the session is archived and gives one action, Unarchive, that makes it writable again in place. The person keeps the transcript, the link and the context.

## When to use
- Sessions are archived automatically (after inactivity, when the container is reclaimed) or by hand, and people come back to them from history, links or notifications.
- Bringing a session back is cheap enough to do on demand: restoring its state or provisioning a fresh environment for it.
- The transcript is still worth reading while the session is archived.

## When not to use
- The session is gone for good (deleted, expired past retention). Say so and offer to start a new session; don't show an Unarchive that can't work.
- The person can't unarchive it (someone else's shared session, view-only access). Show a read-only notice without the action, or use **Access Request**.
- The run failed or was interrupted. That's **Generation Error** or **Checkpoint Restore**, not an archived state.
- Archived items in a list or sidebar. Mark them there; this pattern is the state of an open session.

## Anatomy
- Banner: sits exactly where the composer goes, same width, on a muted background with no border, so it reads as a state rather than an alert.
- Message: one sentence, what happened and what to do ("This session is archived. Unarchive it to keep working in it.").
- Detail (optional): when or why it was archived ("Archived after 7 days without activity.").
- Unarchive button: a quiet secondary button on the right; it shows a spinner and "Unarchiving…" while the session comes back.
- Transcript: above, unchanged and fully readable, with copy and links still working.

## Behavior
- While archived, nothing that writes is offered: no composer, no retry or regenerate on messages. Reading, copying and sharing still work.
- Unarchive works in place. The banner shows its pending state, then is replaced by the composer, and focus moves into it.
- Restore the unsent draft if the session had one when it was archived.
- If unarchiving fails, keep the banner, say so in a line under the message and leave the button ready to try again.
- If unarchiving takes long (provisioning a new environment), keep the pending state on the button and let the person keep reading; don't block the page.
- Archiving again (from a menu) brings the banner back with the same message.

## Content guidelines
- Lead with the state, then the action: "This session is archived. Unarchive it to keep working in it."
- Use the same verb on the button as in the message: "Unarchive", not "Restore" or "Reopen".
- Give a reason only when it helps the person decide or understand: "Archived after 7 days without activity."
- Don't imply loss. If nothing was lost, don't say "expired" or "closed".

## Accessibility
- The banner is a \`role="status"\` region, so its message is read when the session opens or is archived.
- The button keeps one accessible name per state ("Unarchive", then "Unarchiving…") and sets \`aria-busy\` while pending.
- A failure is announced with \`role="alert"\` and focus stays on the button so the person can try again.
- After unarchiving, focus moves to the composer that replaced the banner. Under \`prefers-reduced-motion\` the swap fades instead of sliding.

## Related patterns
- **Share Session** — Use it as well: an archived session can still be shared and read.
- **Checkpoint Restore** — Use it instead to go back to an earlier point inside an active session.
- **Background Tasks Drawer** — Use it to show sessions that are still running, before any of them are archived.
- **Generation Error** — Use it instead when a run failed rather than the session being put away.
`;
