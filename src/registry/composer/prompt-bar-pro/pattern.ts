export const pattern = `# Prompt Bar Pro

## Summary
An empty-state composer for launching a new agent session: a row of clickable example prompts above the input (with a shuffle to see other examples), and a bar that lets the user pick where the agent runs (environment) and which agent/config handles it (orchestrator) before they've typed anything. Like the plain Prompt Bar, the text field also supports inline \`@\`-mentions of context/sources and \`/\`-slash commands.

## When to use
- The very first screen of an agent product, before any conversation exists, where a blank text field alone doesn't communicate what the product can do.
- Products where a session can run in more than one place (e.g. a local computer, a browser, the cloud) or be handled by more than one agent/orchestrator profile, and the user should choose that up front rather than mid-conversation.

## When not to use
- Mid-conversation composers — once a session is underway, drop the suggestion row and the environment/orchestrator pickers if they were only relevant to starting a new one (see Prompt Bar for the ongoing-conversation composer).
- Products with only one environment and one agent configuration. Don't show pickers with a single, unchangeable option.
- Suggestions that aren't real, working prompts for the current product. A suggestion chip is an implicit promise that clicking it produces a good result.

## Anatomy
- Suggestion row: 2-4 example-prompt chips (icon + short phrase) plus a shuffle control to reveal a different sample.
- Composer bar: leading add/attach action, an environment picker, the auto-growing text field, an orchestrator/agent picker, a dictation toggle, and a start action.
- Inline \`@\`/\`/\` autocomplete popover, anchored above the composer bar, for mentioning sources or invoking commands without leaving the text field.

## Behavior
- Clicking a suggestion chip populates the input with that prompt (edit or send immediately) rather than submitting it instantly — the user should still get a chance to adjust it.
- Shuffle swaps the visible suggestions from a larger pool; it does not affect anything already typed in the input.
- Environment and orchestrator selection are independent of the text content and persist across shuffles.
- Typing \`@\` or \`/\` opens a filtered popover of sources or commands; arrow keys move the highlight, Enter/Tab inserts the highlighted item, and Escape dismisses the popover without clearing what's typed.
- The start action stays inactive until there's non-whitespace content, exactly like an ordinary send button — this bar still submits a real message, it's just dressed for a first-run moment.

## Content guidelines
- Suggestions are phrased as something the user would say, in imperative or first-person voice ("Review my recent designs"), matched to real, current capabilities of the product.
- Keep the suggestion row to a small, glanceable set (2-4) — this is a hint, not a menu of every possible action.
- Mention and command labels are short, recognizable nouns/verbs; command descriptions state what the command does in a few words.

## Accessibility
- Suggestion chips, the shuffle control, and both pickers must be reachable and operable by keyboard.
- Shuffling suggestions should not silently move keyboard focus; keep focus predictable for a screen-reader or keyboard user who just activated it.
- The environment and orchestrator pickers need labels that make sense out of context (e.g. "Environment: Computer"), not just the bare selected value, for assistive tech.
- The \`@\`/\`/\` autocomplete popover must be fully operable from the keyboard and communicate the current highlighted item to assistive tech.

## Related patterns
- A specialized first-run variant of the Prompt Bar — swap to the plain Prompt Bar once a session actually starts.
`;
