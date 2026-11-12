export const pattern = `# Refine Search

## Summary
A "Refine your search" panel between a search field and its results, where the AI proposes a few filters that would usefully narrow the current result set — each shown as a pill with the number of results it would leave ("Beta (6)"). One click applies a proposal as an ordinary, removable filter; the results and the proposals update together. The user keeps searching the way they already do; the AI only points out the facets worth cutting on.

## When to use
- Search over large, faceted datasets (regulations, documents, records, a pattern catalogue) where a typical query returns too many results and the right facet to narrow on isn't obvious.
- When the filter UI is rich but buried ("Add filters" menus with many fields), so people rarely discover which facet would help.
- When the best next facet depends on the query and the results — something a static facet sidebar can't know.

## When not to use
- Result sets that are already short enough to scan.
- When there is a fixed, well-known facet sidebar people already use; don't duplicate it with an AI panel.
- To rewrite the query itself or answer the question — use a describe-style or natural-language interface instead.

## Anatomy
- **Search field** — the existing keyword search, with its submit button.
- **Applied filters** — removable chips for proposals the user accepted, each marked as AI-suggested, plus a Reset action.
- **Refine panel** — a soft, inset container with a sparkle and the title "Refine your search", and a dismiss (×) button.
- **Proposal pills** — a value label, the resulting count in parentheses, and a trailing search icon that says "this runs a search". Two to three at most.
- **Loading state** — skeleton pills in the panel while proposals are generated; the panel keeps its height.
- **Result summary** — "There are 22 search results sorted by latest update", above the table.

## Behavior
- Proposals are requested after each search and after every filter is added or removed, for the result set as it now stands. Stale responses are dropped.
- Counts are computed by the product from the real results, never taken from the model. Proposals that would leave zero rows, or every row, are not shown.
- Clicking a pill moves it into the applied filters (a short shared-layout move from panel to chip row), filters the results, and the panel reloads with proposals for the narrower set.
- Applied chips are ordinary filters: removing one restores the wider set and its proposals. Reset clears filters and query.
- If no proposal is worth showing, or the request fails, the panel collapses quietly — the search itself never depends on it.
- Dismissing the panel hides it until the next new search.

## Content guidelines
- Title: "Refine your search" — an invitation, not "AI suggestions".
- Pill labels use the dataset's own vocabulary and values ("Active", "Proposed", "Beta"), not sentences. Keep them to one or two words; the field name goes on the applied chip and the tooltip.
- Always show the count. It's what lets someone pick a refinement without trying each one.
- The result summary states the count and the sort order in plain words.

## Accessibility
- The search is a \`role="search"\` form; the panel is a labelled \`<section>\` with \`aria-busy\` while loading and a \`role="status"\` message ("Finding ways to narrow these results").
- Each pill is a \`<button>\` labelled with field, value and count ("Refine by Status Beta, 6 results"); the trailing icon is decorative.
- Applied chips are a labelled list; each remove button names its filter. The AI marker has a text label ("Suggested by AI").
- The result summary is \`aria-live="polite"\`, so applying or removing a filter announces the new count.
- Respect \`prefers-reduced-motion\`: drop the shared-layout move, stagger and skeleton pulse.

## Related patterns
- **Describe Filters** — Use it instead when people can say what they want in their own words and the AI should build the filters.
- **Natural Language Query** — Use it instead when people want to see and edit the query behind the results.
- **Follow-up List** — Use it instead for suggested next questions after an answer, rather than narrowing a result set.
- **Confidence Indicator** — Use it as well when a proposal matches by meaning and the model can say how sure it is.
`;
