export const pattern = `# Follow-Up List

## Summary
A vertical list of suggested next questions shown after an assistant response, each one a full-width row a user can tap to send as their next message. It turns "what else could I ask?" into a menu instead of a blank composer.

## When to use
- After a response where the model can anticipate a handful of natural next questions (a docs answer, a research summary, a completed task) and surfacing them saves the user from typing.
- When the suggestions themselves carry information worth reading in full — multi-clause or slightly long questions that would wrap awkwardly as chips.
- As the primary next action after a response, when there isn't already a busy row of inline actions (copy, thumbs, share) competing for the same space.

## When not to use
- When suggestions are short, single-topic phrases meant to sit alongside other inline actions (copy, regenerate) — use compact wrapping chips instead, so the row stays low-footprint.
- Immediately after every single message in a fast back-and-forth chat — it adds visual weight the user will mostly skip past; reserve it for points where the conversation could naturally branch.
- When there's only one sensible follow-up — a single suggestion reads better as an inline link or a one-line prompt, not a list.

## Anatomy
- A vertical stack of rows, each with a leading "corner-down-right" arrow icon (echoing "this leads to a reply") and the suggestion text.
- A hairline divider between rows; no divider after the last row.
- No container border or background — the list sits directly under the response it follows, reading as part of that turn rather than a separate card.

## Behavior
- Rows animate in with a slight upward fade, staggered a beat apart, so the list doesn't slam onto the screen the instant the response finishes.
- Clicking a row sends that suggestion as the user's next message immediately — it is not a two-step "fill the composer, then let the user edit" interaction.
- Rows appear only once the response they follow has finished streaming, never while it's still generating.

## Content guidelines
- Write suggestions as full first-person questions the user could ask verbatim ("How do I migrate historical data if I switch from Google Analytics"), not fragments or topic labels.
- Keep the list short — three to five suggestions. More than that stops being a quick scan and starts being a list to read.
- Order by how likely the user is to want it next, not alphabetically or by topic grouping.

## Accessibility
- Each row is a real \`<button>\` inside a \`<ul>\`/\`<li>\`, reachable and activatable by keyboard alone.
- The leading icon is decorative (\`aria-hidden\`) — the row's accessible name comes from the suggestion text alone.
- Rows are large tap targets (full-width, generous vertical padding) so the pattern works as well on touch as with a pointer.

## Related patterns
- Streaming Text's \`followUps\` chips are the compact counterpart — short, wrapping suggestions that sit inline with other post-response actions rather than as their own list.
`;
