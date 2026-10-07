export const pattern = `# Image Peek

## Summary
A row of tiny image thumbnails that enlarges into an anchored preview card on hover, focus, or click. The card grows out of the thumbnail it belongs to, shows the image at a readable size with a provenance label ("Read", "Generated") and an "N of M" counter, and lets the user step through the rest of the set without leaving the conversation.

## When to use
- An agent's activity line or tool summary references images it read, captured, or produced (screenshots, generated assets, files it inspected) and the user may want to check them without opening each one.
- Space is tight — a message header or trace row — so images must sit at thumbnail size by default.
- The user needs a quick look, not editing, zooming, or downloading.

## When not to use
- Images that are the main content of the answer (a generated image, a chart) — show them inline at full size instead.
- Detailed inspection, pixel-level zoom, or annotation — use a full-screen lightbox or a dedicated viewer.
- Images the user is about to send — use Attachment Chip, which carries upload progress and removal.
- Touch-only surfaces where hover never happens — the pattern still works by tap, but a full-width inline gallery is usually clearer.

## Anatomy
- Overflow chip: "+N", shown when the set is larger than the visible maximum (default 3); the newest images stay visible.
- Thumbnails: small rounded tiles (about 40×28), cropped with object-fit cover; the active one gets a ring.
- Preview card: anchored below the row and right-aligned to it.
  - Image area at 16:10, with previous/next arrows revealed on hover or keyboard focus.
  - Caption bar: provenance label on the left, "N of M" counter on the right.

## Behavior
- Hovering a thumbnail opens the card after a short intent delay (~150ms) so sweeping the pointer past doesn't flash it. Once open, moving to another thumbnail swaps the image immediately — no close-and-reopen.
- The card scales up from the active thumbnail's position on a quick spring (~0.3s) and shrinks back toward it on close, so the relationship between thumbnail and preview is visible.
- Switching images slides the new one in from the direction of travel and crossfades the old one out; the card itself does not resize.
- Clicking a thumbnail pins the card open; it then stays open when the pointer leaves and closes on a click outside, Escape, or a second click on the same thumbnail. Unpinned, it closes shortly after the pointer leaves both the row and the card.
- The "+N" chip pins the card on the newest hidden image; the arrows and arrow keys cycle through the whole set, hidden ones included, wrapping at the ends.

## Content guidelines
- The label states where the image came from in one word or two — "Read", "Generated", "Screenshot" — not the filename, which belongs in the alt text or a tooltip.
- The counter counts the whole set, not just the visible thumbnails.
- Keep thumbnails in chronological order, newest on the right, nearest the card's anchor.

## Accessibility
- Each thumbnail is a real \`<button>\` named "Enlarge <alt text>", with \`aria-expanded\` and \`aria-controls\` pointing at the card.
- Keyboard focus opens the card the same way hover does; Left/Right arrows step through images and Escape closes it.
- The enlarged image carries the real alt text; the thumbnail image is decorative (\`alt=""\`) because its button already names it.
- The counter is a polite live region so stepping through images is announced.
- With \`prefers-reduced-motion\`, the scale and slide are replaced by a plain fade.

## Related patterns
- Attachment Chip covers images on their way in (the composer); Image Peek covers images an agent has already used or produced.
- Sources Stack is the equivalent compact-summary-that-expands for links rather than images.
`;
