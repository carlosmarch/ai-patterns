export const pattern = `# Confidence Indicator

## Summary
A small visual signal attached to an AI-generated claim, answer, or extraction that communicates how sure the system is — as a qualitative band (High / Medium / Low), not a fabricated precise number. Comes in two shapes: a labeled badge for a whole response or block, and a compact dot for an inline, per-claim signal inside running text.

## When to use
- Next to an answer, classification, or extraction whose correctness genuinely varies (a document field extraction, an OCR read, a retrieval match, a generated label).
- Anywhere a low-confidence result would otherwise look identical to a high-confidence one and the user could act on it without checking.
- Per-claim, inline, when a single response mixes well-supported and shaky statements (use the dot variant next to the specific sentence or value, not the whole message).

## When not to use
- On every single response by default — if confidence is uniformly high or the system has no real signal for it, showing the indicator anyway trains users to ignore it.
- As a substitute for actually improving the answer. A low-confidence badge is not a fix for a bad retrieval or a weak extraction; use it as a signal, and pair it with a way to verify or correct (a source link, an edit affordance), not just a color.
- With a precise percentage the underlying model doesn't actually produce or that isn't calibrated (see Content guidelines).

## Anatomy
- Signal bars: three small bars of increasing height; the number filled (1/2/3) encodes the level. Decorative only — never the sole carrier of meaning.
- Label: the actual meaning in words — "High confidence", "Medium confidence", "Low confidence", or a domain-specific override ("Likely correct", "Needs review").
- Optional reason disclosure: a short, specific explanation ("Only one source mentions this date"), revealed on click/tap for the badge variant. Omit if there's nothing specific to say — don't invent a generic filler reason.
- Dot variant: the signal bars collapse to a single small colored dot for inline placement next to a word or value, with the level/reason available via title text or an adjacent tooltip rather than a visible label (there's no room for one inline).

## Behavior
- Static by default — it reflects a value computed once, it doesn't animate or update on its own.
- The badge variant's reason (when provided) is collapsed by default and expands in place on click; it never opens as a popover that covers surrounding content.
- Clicking the dot variant (when it carries a reason) opens the same kind of disclosure, anchored near the dot.
- Never interactive in a way that changes the underlying confidence — this component only displays a value it's given.

## Content guidelines
- Prefer three bands (High/Medium/Low) over a numeric percentage. Most systems don't have a genuinely calibrated confidence score, and a number like "87%" implies precision that misleads more than a band does.
- If you do show a number, it must come from an actually calibrated source (e.g., a model's real logprob-derived score, a retrieval similarity above a validated threshold) — never a number invented to look precise.
- Reason text is one short, concrete sentence about *why* the confidence is what it is, not a restatement of the label ("Low confidence" → reason should not be "This has low confidence").
- Low confidence should read as informative, not alarming — this is a "double-check this" signal, not an error.

## Accessibility
- Never convey the level by color alone — the text label (badge variant) or accessible name (dot variant, via \`aria-label\`/\`title\`) must state it in words for colorblind users and screen readers.
- The signal-bars glyph is \`aria-hidden\` — it's decorative reinforcement of the label, not an independent source of information.
- The reason disclosure toggle needs \`aria-expanded\` and, ideally, is a real \`<button>\` so it's reachable and operable by keyboard.

## Related patterns
- Inline Citation — when the reason for low confidence is "check the source," a citation marker is often a better fix than a bare confidence dot.
- Tool Approval — for actions (not claims) where uncertainty should gate execution rather than just being displayed.
`;
