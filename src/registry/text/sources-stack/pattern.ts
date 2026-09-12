export const pattern = `# Sources Stack

## Summary
A compact "N sources" pill showing overlapping favicons for the sources behind an answer, which expands in place into a linked list of every source. It's the answer-level counterpart to Inline Citation's claim-level footnote — one glance at the total, one tap for the full list.

## When to use
- Summarizing all the sources an answer drew on, in a single, low-footprint control rather than a dedicated section that always takes up space.
- The exact source count and provenance (which domains) matter to the user's trust in the answer, but the individual claim-to-source mapping doesn't need to be shown inline.
- After a research or search-heavy answer where listing every source inline (via Inline Citation) would be excessive, but omitting sources entirely would undersell the work done.

## When not to use
- When a specific sentence needs to point at a specific source — use Inline Citation for that claim-level link; this pattern only summarizes the whole set.
- For a single source. A stack implies plural; one source reads better as a plain link or a single favicon + domain label.
- As a replacement for inline citations in a long, multi-claim answer — pair the two rather than picking one over the other.

## Anatomy
- Collapsed trigger: a pill with a stack of overlapping favicons (2-3 visible, each ringed to separate it from the one behind) followed by the total count ("7 sources") and a chevron.
- Expanded list: one row per source, each with its favicon, title, domain, and an external-link affordance, opening in a new tab.

## Behavior
- Clicking the pill toggles the list open/closed in place, pushing surrounding content rather than overlaying it.
- The favicon stack always shows the same leading few sources regardless of how many are open in the list — it's a preview, not a paginated view.
- A source with no reachable favicon falls back to a generic globe icon rather than a broken image.
- The chevron rotates to reflect open/closed state; the transition animates height, not just opacity, so surrounding layout doesn't jump.

## Content guidelines
- Titles are the source's own page title, not a paraphrase; domains are the bare hostname, no protocol or path.
- Order sources by relevance or citation order, not alphabetically — the first favicon in the stack should be the most load-bearing source.

## Accessibility
- The trigger is a real \`<button>\` with \`aria-expanded\` and \`aria-controls\` pointing at the list.
- The favicon stack in the collapsed trigger is decorative (\`aria-hidden\`) since the count text already states how many sources there are.
- Each expanded row is a real \`<a>\` to the source, reachable and activatable by keyboard alone.

## Related patterns
- Inline Citation is the claim-level counterpart — a numbered marker tied to one sentence, versus this pattern's answer-level summary of every source used.
`;
