export const pattern = `# AI Disclosure Badge

## Summary
A small "AI-generated" label attached to content an AI produced, which opens a card with its provenance: which model, when, and whether a person reviewed or edited it. It makes the origin of content clear without getting in the way of reading it.

## When to use
- Content an AI wrote, drew or summarised that sits next to human-made content — docs, feeds, product listings, support replies.
- Generated media that may be shared outside the product (images, video, audio), where the label should travel with it.
- Anywhere regulation or policy requires AI content to be labelled.

## When not to use
- Inside a chat with an assistant, where every reply is obviously AI. Labelling each message is noise.
- As the only safeguard for generated media that leaves the product — pair it with a machine-readable watermark or content credentials.
- As a quality or confidence signal. Use Confidence Indicator for "how sure", this pattern only says "who made it".

## Anatomy
- Badge: a sparkle mark and a short label, in one of three variants — chip (next to a title), overlay (corner of an image), inline (byline under text).
- Provenance card: a one-line headline ("Created with AI" / "Created with AI, reviewed by a person"), then model, generated time and editor rows.
- Optional caveat line at the bottom of the card.

## Behavior
- Hover or focus previews the card; a click pins it open until the next click, a click outside or Escape.
- When a person edits the content, the label changes from "AI-generated" to "AI-assisted" and the card names the editor. Don't drop the badge after an edit.
- With no details, the badge renders as plain text and is not interactive.
- The badge stays visible when content is copied into another surface in the product (quotes, embeds, exports).

## Content guidelines
- Use plain words: "AI-generated", "AI-assisted". Avoid "Magic" or brand-only names that don't say AI.
- Keep the caveat factual and short: "May contain mistakes. Check important facts."
- Show times in the user's locale and relative where it helps ("Today, 14:02").

## Accessibility
- The label is real text, not only an icon, so it is read by screen readers and survives high-contrast modes.
- With details, the badge is a button with \`aria-expanded\` and \`aria-controls\` pointing at the card; the card is reachable on keyboard focus.
- The overlay variant keeps WCAG AA contrast on any image by sitting on a dark translucent backing.

## Related patterns
- Confidence Indicator says how reliable a value is; use both when AI content also needs a reliability signal.
- Inline Citation and Sources Stack show what the content is based on; this badge only shows who made it.
- Source Trust Card explains the trustworthiness of a source; the disclosure card is its counterpart for the content itself.
`;
