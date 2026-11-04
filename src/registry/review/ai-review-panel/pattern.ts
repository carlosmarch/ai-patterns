export const pattern = `# AI Review Panel

## Summary
A side panel for checking values the model extracted from a source document. Each field is a collapsible card showing the extracted value, the model's reasoning, and the exact passages it relied on. Hovering a passage highlights it in the source; clicking scrolls to it. The user accepts or dismisses each field, or applies every pending one at once, and a segmented status bar and filter tabs show how much is left to review.

## When to use
- Document extraction: contracts, regulatory notices, invoices, filings, medical or insurance forms, where each value must be traceable to the text.
- Reviews where the user is accountable for the result and needs to see *why* the model chose a value, not just the value.
- Long sources where finding the supporting passage by hand would take longer than checking it.

## When not to use
- Values with no single source passage (summaries, sentiment, scores). Show reasoning in a trace instead.
- Enrichment from the open web, where the user mostly fills empty fields. Use AI Fill Drawer.
- One or two fields. Inline suggestions next to the input are lighter than a panel.
- When values can be edited freely and checked later. Without an accountable review step, the per-field ceremony is overhead.

## Anatomy
- **Header** — ✦ title, "View source", close.
- **Status bar** — a segmented bar, one segment per status (dismissed, pending, accepted), each sized by its share of fields, with "N of M reviewed".
- **Filter tabs** — All, Pending, Accepted, Dismissed, each with a count badge tinted in its status color.
- **Search** — filters by field name or value.
- **Field card** — collapsed: status dot, field name, value preview, chevron. Expanded:
  - **Value** — the extracted value, marked ✦.
  - **Reasoning** — one short paragraph, collapsible.
  - **Evidence** — one or more verbatim quotes with an accent rule on the left and the hint "Hover to preview · click to view in text", collapsible.
  - **Actions** — Pending: Dismiss / Accept. Accepted: Undo. Dismissed: Restore.
- **Footer** — a full-width "Apply all pending (N)" button, which becomes "All fields reviewed" when nothing is pending.

## Behavior
- Every field starts pending unless the host already knows otherwise (e.g. accepted in an earlier session).
- One card is open at a time. Opening another closes the previous one.
- Accept and Dismiss change the dot, the tab counts and the status bar together; segments animate to their new widths.
- Restore and Undo both return a field to pending. Nothing is final until the host saves.
- Under a status tab, a field whose status changes leaves the list with a short exit animation, so the user sees where it went.
- "Apply all pending" accepts only pending fields. Dismissed fields stay dismissed.
- Hovering or focusing a quote previews it: the matching passage is highlighted in the source. Leaving clears the preview. Clicking pins the highlight and scrolls the source to it.
- Evidence must be a verbatim substring of the source. Drop any quote the host can't find in the source before passing it in, rather than highlighting the wrong passage.
- Search and the tab filter combine. An empty result says what was searched ("No fields match 'date'").

## Content guidelines
- Field names are the reviewer's vocabulary ("Degree of binding force"), sentence case.
- Values are short and normalized: dates in one format, enums from the field's allowed list.
- Reasoning is one to three sentences, cites what in the text decided it, and states doubt plainly ("It may not count as a consultation deadline") rather than hedging every value.
- Quotes are the shortest passage that supports the value — a clause, not a paragraph.
- Count, don't celebrate: "6 of 8 reviewed", "Apply all pending (3)".

## Accessibility
- Filter tabs are a \`tablist\` with roving focus; ←/→ move between them.
- Each card header is a button inside a heading, with \`aria-expanded\` and \`aria-controls\`; the status is in its accessible name, so color is never the only signal.
- The status bar has a text alternative ("5 accepted, 2 pending, 1 dismissed").
- Each quote is a button labelled "View in source: <quote>". Focus triggers the same preview as hover.
- Status changes and "Apply all" are announced in a polite live region.
- With \`prefers-reduced-motion\`, cards fade instead of expanding and the bar jumps to its new widths.

## Related patterns
- AI Fill Drawer — fills empty record fields; use it when values come from the web, not one document.
- Inline Citation — the same source-linking idea inside generated prose.
- Confidence Indicator — add next to a value when the model reports how sure it is.
- Human in the Loop — when a single agent action, not a set of values, needs approval.
`;
