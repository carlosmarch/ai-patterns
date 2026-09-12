export const pattern = `# Attachment Chip

## Summary
A compact chip representing one file or image attached to a composer — thumbnail or file-type icon, a circular progress ring while it uploads, and a remove control — laid out in a tray that also shows a drop-zone overlay while a file is dragged over it. It lets the user see exactly what's about to be sent, and back out of it, before the message goes.

## When to use
- Any composer that accepts file or image attachments and needs to show what's queued before the user sends.
- When uploads can take real time (large files, slow networks) and the user benefits from per-file progress instead of a single blocking spinner.
- Any time an attachment might fail and the user needs a way to retry or remove it without retyping their message.

## When not to use
- For attachments on a message that has already been sent — show those inline in the message itself, not as an in-progress chip.
- As a general file-manager UI. This is for the handful of items about to go out with one message, not for browsing or organizing a file library.
- When the host truly cannot support removing an in-flight upload — don't show a remove control that doesn't actually cancel anything.

## Anatomy
- Drop-zone overlay: a dashed-border highlight with a "Drop to attach" label that appears over the whole tray while a file is dragged over it.
- Chip: a thumbnail (for images) or a file-type icon, the filename, the file size, and a remove (×) button.
- Progress ring: a circular indicator over the thumbnail/icon while uploading; replaced by the plain thumbnail/icon once the upload completes.
- Error state: an alert tint and icon with an inline "Retry" affordance if the upload fails.

## Behavior
- Dragging a file over the composer shows the drop-zone overlay immediately; dropping it (or picking via an attach button) adds a chip right away in an uploading state, before the network call resolves.
- The progress ring fills as the upload progresses; if no real progress fraction is available, it spins indeterminately instead of freezing at 0.
- The remove button works at any stage — including mid-upload, where it also cancels the in-flight request.
- Multiple attachments lay out in a horizontal, scrollable row above the text input rather than stacking vertically and pushing the input down.
- On failure, the chip switches to its error state with a visible "Retry" rather than silently disappearing or failing the whole send.

## Content guidelines
- Truncate long filenames in the middle, keeping the extension visible, so \`quarterly-report-final-v2.pdf\` reads as \`quarterly-…-v2.pdf\`, not an unreadable prefix.
- Show file size once the upload starts, not before there's anything to report.

## Accessibility
- Always provide a file-picker button as an equivalent to drag-and-drop — drag-and-drop must never be the only way to attach a file.
- Expose upload progress as \`role="progressbar"\` with \`aria-valuenow\`, not through animation alone.
- Give each remove button a descriptive accessible name (\`Remove quarterly-report.pdf\`), not a bare "×".

## Related patterns
- Prompt Bar and Prompt Bar Pro are the composers this tray typically lives inside.
- Diff Summary is a similar "batch of items with per-item status" pattern for a different context (file edits instead of uploads).
`;
