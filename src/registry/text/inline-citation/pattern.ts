export const pattern = `# Inline Citation

## Summary
A small, numbered footnote-style marker set right after a specific claim in the text, that reveals its source — title, domain, a short snippet, and a link out — on hover or click, without breaking the reader's flow. It's the claim-level counterpart to a general "here's what I searched" indicator.

## When to use
- A specific sentence or clause in the answer is backed by a specific source, and the user may want to verify it without leaving the page or scrolling to a source list.
- Any streamed or static answer that cites multiple distinct sources for different claims, where a single end-of-answer source list would lose the claim-to-source mapping.

## When not to use
- For a blanket "this response used web search" signal with no specific claim attached — that belongs in the answer's own inline source chip (see Related), not a numbered footnote.
- On nearly every sentence. Citing everything turns the text into a wall of superscripts and trains the user to stop noticing them — reserve this for claims that actually need backing.
- As the only way to see all sources at once — pair it with a full source list when the user wants the complete picture, this marker is for in-context verification of one claim.

## Anatomy
- Marker: a small raised numeral (or a compact icon + numeral), inline immediately after the clause it supports.
- Popover: source title, domain/favicon, a one-line snippet, and a link to open the source.
- Multiple citations on one clause render as adjacent numerals, each independently triggerable — never merged into a single marker.

## Behavior
- Hovering or focusing the marker opens the popover; it closes on mouse-leave/blur, on Escape, or on an outside click.
- On touch devices, where hover doesn't apply, tapping the marker opens the popover; tapping again or tapping outside closes it.
- The popover repositions to stay on-screen near a viewport edge (flips above/below or left/right as needed) rather than clipping.
- Numerals count up in the order sources first appear in the text, not alphabetically or by source importance.

## Content guidelines
- The snippet is a short excerpt that supports the specific claim, not the whole source page.
- Marker numerals are literal reference numbers, not a rating or confidence score — don't overload their meaning.

## Accessibility
- The marker is a real focusable element (\`<button>\` or \`<a>\`), never a styled, non-interactive \`<span>\`.
- The popover content is associated via \`aria-describedby\` (or an equivalent live association), so assistive tech can reach it from the marker.
- Never rely on hover alone — keyboard focus and touch tap must open the same popover.

## Related patterns
- Streaming Text's inline source chip is the word-level "this came from a search" signal; Inline Citation is the claim-level footnote built on top of a specific source.
`;
