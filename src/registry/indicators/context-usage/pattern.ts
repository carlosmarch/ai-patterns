export const pattern = `# Context Usage

## Summary
A card that shows how full the model's context window is: a token count against the limit, a segmented bar of what's taking the space (chat, files, tools, system prompt, memory), a legend that picks out each part, and a Compact action that summarises older content to free room before the window runs out.

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
- Total: the tokens used in large type ("175.6K"), with the limit beside it ("of 200K").
- Segmented bar: one block per source, sized by its share of the window, followed by a neutral block for free space. The whole bar is the window.
- Legend: one chip per source with its colour swatch and name.
- Low-space note: appears near the limit, saying how much is left and what compacting will do.

## Behavior
- Segments resize as content is added or removed, and the total animates to its new value.
- Hovering or focusing a legend chip (or hovering a segment) dims the other segments and swaps the total for that source's tokens and share ("39.2K · files · 20%").
- Past a threshold (90% by default) the low-space note appears and Compact becomes the primary action.
- Compact shows a pending state ("Compacting…"), then the bar shrinks as older turns are replaced by a summary and stale tool output is dropped. System prompt and memory are kept.
- Always offer compaction before the product does it on its own; when it does auto-compact, say so in the note.

## Content guidelines
- Format token counts compactly with one decimal ("175.6K", "1.2M"); never show raw counts like 175,612.
- Name sources in the user's terms (Chat, Files, Tools), not internal ones (messages array, tool_results).
- Keep the source list short — five or so. Fold rare sources into "Other".
- The low-space note says what's at stake, not just a number: "24.4K left — compact to keep earlier details from being dropped."

## Accessibility
- The bar is \`role="meter"\` with \`aria-valuetext\` ("175.6K of 200K tokens used").
- Legend chips are buttons with \`aria-pressed\` and a visually hidden token count, so each source can be inspected from the keyboard.
- The total and low-space note are in an \`aria-live="polite"\` region that also describes the Compact button.
- Colour is never the only cue: every segment has a labelled chip, and the warning is text.
- Animations are skipped when the user prefers reduced motion.

## Related patterns
- **Cost Estimate** — Use it instead when the constraint is credits or money for a single run, not space in the window.
- **Rate Limit** — Use it instead for caps on how much people can use over time.
- **Memory Panel** — Use it as well to let people see and edit what's kept across sessions, which also takes up context.
`;
