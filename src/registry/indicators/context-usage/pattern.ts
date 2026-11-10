export const pattern = `# Context Usage

## Summary
A card that shows how full the model's context window is: a token count and percentage against the limit, a thin segmented bar of what's taking the space (chat, files, tools, system prompt, memory), a breakdown with each source's tokens and share, the buffer held back for auto-compaction, the free space left, and a Compact action that summarises older content to free room before the window runs out.

## When to use
- Long-running chats, coding agents and research sessions where the context fills up and the model starts forgetting or the product starts truncating.
- Products that let people add large inputs (files, repos, tool output) and need them to see the cost of each.
- Anywhere you offer compaction or summarisation, so people can choose when it happens instead of being surprised by it.

## When not to use
- Short, casual chats that never come close to the limit. A meter there is noise.
- To show what a run will cost in money or credits — use Cost Estimate.
- To show usage caps over time (messages per hour) — use Rate Limit.

## Anatomy
- Header: a title ("Context") and the Compact action.
- Total: the tokens used in large type ("140.6K"), with the limit beside it ("of 200K") and the share used on the right ("70% used").
- Segmented bar: a thin bar with one block per source, sized by its share of the window, then a neutral block for free space and a darker grey block for the autocompact buffer. The whole bar is the window.
- Breakdown: one row per source — colour swatch, name, tokens ("96.4K") and share of the window ("48.2%") — followed by muted, non-interactive rows for the autocompact buffer and free space, so the rows add up to the limit.
- Low-space note: appears near the limit, saying how much is left before auto-compact and what compacting now changes.

## Behavior
- Segments resize as content is added or removed, and the total animates to its new value.
- Hovering or focusing a breakdown row (or hovering a segment) dims the other segments and swaps the total for that source's tokens and share ("26.2K files · 13% used").
- The autocompact buffer is reserved, not free: it's drawn apart from free space, and the product compacts on its own once the sources reach it.
- Past a threshold (90% of the usable window — the limit minus the buffer — by default) the low-space note appears and Compact becomes the primary action.
- Compact shows a pending state ("Compacting…"), then the bar shrinks as older turns are replaced by a summary and stale tool output is dropped. System prompt and memory are kept.
- Always offer compaction before the product does it on its own; when it does auto-compact, say so in the note.

## Content guidelines
- Format token counts compactly with one decimal ("140.6K", "1.2M"); never show raw counts like 140,612. Shares in the breakdown take one decimal ("5.3%") so small sources don't all read as 0% or 1%.
- Name sources in the user's terms (Chat, Files, Tools), not internal ones (messages array, tool_results).
- Keep the source list short — five or so. Fold rare sources into "Other".
- Call reserved space what it is ("Autocompact buffer"), never fold it into free space.
- The low-space note says what's at stake, not just a number: "13.4K left before auto-compact — compact now to choose what's kept."

## Accessibility
- The bar is \`role="meter"\` with \`aria-valuetext\` ("140.6K of 200K tokens used").
- Source rows are buttons with \`aria-pressed\`, so each source can be inspected from the keyboard; the buffer and free-space rows are plain list items.
- The total and low-space note are in an \`aria-live="polite"\` region that also describes the Compact button.
- Colour is never the only cue: every segment has a labelled row with its numbers, and the warning is text.
- Animations are skipped when the user prefers reduced motion.

## Related patterns
- **Cost Estimate** — Use it instead when the constraint is credits or money for a single run, not space in the window.
- **Rate Limit** — Use it instead for caps on how much people can use over time.
- **Memory Panel** — Use it as well to let people see and edit what's kept across sessions, which also takes up context.
`;
