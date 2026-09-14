export const pattern = `# Invite Members Modal

## Summary
A two-step modal for adding people to any record — an assessment, workspace, or any object with an access list — and assigning them a role. Entry point shows an "Invite users" button when nobody has access, or a row of circular avatars once people are assigned. Role options are passed in by the calling surface, making the same modal work for a single-role workflow or a full Viewer/Editor/Admin hierarchy.

## When to use
- Any surface that manages per-record access with role assignment.
- When invitees come from two pools: searchable org members and external email addresses.
- When a record can have many collaborators and needs a centralized place to add, change, or remove them.

## When not to use
- Simple collaborator pickers with no roles (use a plain multi-select instead).
- When access is determined by team or group membership rather than individual assignment.
- When the invite is a one-off action with no persistent access list to manage afterward.

## Anatomy

### Entry point
- **Empty state**: Outlined dashed button with a user-plus icon and "Invite users" label.
- **Populated state**: A row of up to four circular avatars — initials on a color-coded background for known users, envelope icon for email-only invites — followed by a "+N" overflow chip when there are more than four. Clicking either state opens the modal.

### Modal — Step 1: Manage access
The default view when the modal opens.

- **Search field**: Full-width, placeholder "Search by name or invite by email…". Opens a dropdown on focus or typing.
- **Dropdown**:
  - **Invite by email row** (always pinned at top): plus-circle icon; email typed so far as the primary label, or "Type an email to invite" when the field is empty; sub-text "They'll receive an email invitation to join." Disabled when field is empty.
  - **Org member rows**: avatar with initials, name, email — filtered live. Members already assigned are excluded.
- **People with access**: Scrollable list below the search field, visible only when the record already has assignees. Each row: avatar, name, email, compact inline role selector, status badge ("Confirmed", "Invite sent", "Awaiting"), resend icon, remove icon. The role selector takes effect immediately. Resend shows a brief spinning animation then resets. Remove opens a nested confirmation.
- **General access**: Always visible at the bottom of step 1. A row with an icon, a label button ("Restricted" or "Anyone with the link"), and a description. Switching to "Anyone with the link" adds a compact role selector on the right of the row. Options: "Restricted — only people added can access this project" and "Anyone with the link — anyone with the link can view this project."
- **Footer**: A single "Done" button that closes the modal.

### Modal — Step 2: Compose invite
Reached automatically when the first chip is added from the dropdown.

- **Header**: Gains a back arrow. Pressing it clears all new chips and returns to step 1 without sending anything.
- **Search + chips field**: The search field carries forward and now shows chips for everyone being invited. Placeholder changes to "Add more people…" once at least one chip exists. New people can still be added.
- **Chips**: Each chip = avatar/envelope + truncated name + remove ×. No role label inside the chip.
- **Role selector**: Sits beside the search field, outside the chips. Sets the role that will be applied to the next person added. Defaults to the least-privileged role (index 0 of the roles array). Does not retroactively change chips already in the field.
- **Invite message**: Textarea below the search area, pre-filled with a caller-supplied default, fully editable.
- **Footer**: "Cancel" (discards chips, closes) and "Send invite" (saves, closes).

### Nested remove confirmation
Overlays the modal when the remove icon is clicked on a current member. Shows the person's name and the message "[Name] will lose access to this project.", with "Cancel" and a destructive "Remove" button.

## Behavior
- Adding the first chip automatically advances from step 1 to step 2.
- Removing all chips in step 2 returns to step 1.
- The role selector beside the search field only affects people added after it is changed.
- The inline role selector in "People with access" takes effect immediately; no separate save step.
- Resending an invite shows a brief spinning animation on the resend icon, then resets.
- Pressing Escape: closes an open remove confirmation first, then closes the modal.
- Backspace in an empty search field removes the last chip.
- Enter on a non-empty field adds the typed value as an email chip.
- Footer "Done" (step 1) closes without notification. "Send invite" (step 2) saves and closes. "Cancel" or ✕ discards unsent chips and closes without changes.
- Switching general access from "Anyone with the link" back to "Restricted" hides the role selector; the previously chosen link-role is remembered if the user switches back again.

## Content guidelines
- Entry point label: "Invite users" — not "Share", "Assign", or "Add collaborators".
- Modal title: "Invite members" — consistent regardless of which roles are available.
- Step 1 placeholder: "Search by name or invite by email…"
- Step 2 placeholder (chips present): "Add more people…"
- Invite-by-email sub-text: "They'll receive an email invitation to join." One sentence.
- Default invite message: caller-supplied; should be contextual, not generic.
- Status labels: "Confirmed", "Invite sent", "Awaiting" — sentence case.
- Remove dialog body: "[Name] will lose access to this project." — specific, not vague.
- If only one role exists, the selector still renders; it is never hidden.

## Accessibility
- Modal: \`role="dialog"\`, \`aria-modal\`, \`aria-label="Invite members"\`.
- Focus moves to the search input when the modal opens and when advancing to step 2.
- Escape closes an open remove confirmation first, then the modal.
- Role selectors use \`aria-haspopup="listbox"\` and \`aria-expanded\`; their dropdowns are portal-rendered to avoid clipping.
- Chip remove buttons carry \`aria-label="Remove [name]"\`.
- Resend button \`aria-label\` changes to "Invite resent" during the feedback window.
- Avatar stack trigger carries \`aria-label="N member(s) — click to manage"\`.
- Reduce motion: use opacity-only transitions; skip scale and y transforms.

## Related patterns
- Collaborative Presence — shows the same assignees as a live avatar stack; pairs naturally as the read view for what Invite Members writes
- Tool Approval — another modal-adjacent permission flow with confirm/deny actions
- Attachment Chip — chip removal shares the same backspace-to-remove and × affordance
`;
