export const pattern = `# Source Trust Card

## Summary
A paginated card for a single cited source, showing its favicon, title, and
snippet, plus an optional trust badge that tells the reader why the source
is credible. A row of domain pills below lets the reader jump straight to
any source in the set.

## When to use
- An AI answer cites a small set of web sources (roughly 2–6) and the
  reader may want to inspect each one before trusting the answer.
- At least one source benefits from an explicit credibility signal — an
  official vendor site, a government domain, a well-known registrar or
  standards body — where "why should I trust this" isn't obvious from the
  domain alone.
- The reader is likely to check sources one at a time rather than scan
  them all at once (contrast with a list or stack view).

## When not to use
- A single source — show it inline or as a plain link; pagination chrome
  for one item is dead weight.
- More than ~6–8 sources — pagination through a long set is tedious; use
  \`Sources Stack\` (an expandable list) instead.
- Every source is equally low-stakes and none needs a trust explanation —
  a plain source list is lighter and just as useful.
- Inline, mid-sentence citation markers — use \`Inline Citation\` for that;
  this pattern is a standalone card, not a footnote.

## Anatomy
- Header: previous/next controls, a "current/total" counter, and a
  "N sources" label.
- Source body (clickable, opens the source): favicon, domain, title,
  short description/snippet.
- Trust badge (optional, only when a source is verified): shield icon,
  "Trusted" label, one sentence explaining why, and a "Learn more" link.
- Domain pill row (only when there's more than one source): one pill per
  source for direct navigation; the active pill is visually distinct.

## Behavior
- Previous/next buttons cycle through sources with a short slide + fade
  transition in the direction of travel; wrap around at the ends.
- Clicking a domain pill jumps directly to that source, sliding in the
  correct direction (forward if later in the set, backward if earlier).
- The whole source body (favicon, title, description) is a single link
  that opens the source in a new tab.
- The trust badge only renders when the current source has a trust
  reason — most sources in a set will not have one, and that's expected.
- Favicon falls back to a generic globe icon if the image is missing or
  fails to load.

## Content guidelines
- Title: the source's actual page title, truncated rather than rewritten.
- Description: a one- to two-line snippet in the source's own voice, not
  editorial commentary.
- Trust reason: one short sentence stating the concrete basis for trust
  (e.g. "is trusted for official domain registration... from a U.S.
  provider"), not a vague "this is a good source."
- Domain pills show the bare domain (\`cloudflare.com\`), not the full title.

## Accessibility
- Previous/next buttons need accessible names ("Previous source" / "Next
  source"), not just chevron icons.
- The counter and "N sources" text give screen reader users the set size
  and position without relying on the visual pagination alone.
- Domain pills use \`aria-current\` on the active source so assistive tech
  can tell which one is showing.
- Respect \`prefers-reduced-motion\`: reduce or remove the slide transition
  between sources.

## Related patterns
- \`Sources Stack\` — better for larger sets browsed as a single list
  rather than one at a time.
- \`Inline Citation\` — for footnote-style markers inside response text,
  rather than a standalone card.
`;
