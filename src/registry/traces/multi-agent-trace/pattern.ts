export const pattern = `# Multi-Agent Trace

## Summary
A tree/list view of an orchestrator's parallel sub-agent tasks — each with its own name, live status, current-step label, and collapsible step list — so the user can watch several agents work at once instead of inferring parallel progress from one linear trace. The multi-agent counterpart to Expandable Trace.

## When to use
- An orchestrating agent has dispatched more than one sub-agent or task concurrently, and the user benefits from seeing each one's independent progress and outcome.
- Any workflow where sub-agents can finish in a different order than they started, or one can fail while others keep going — a single linear trace can't represent that.

## When not to use
- For a single agent working through one sequence of steps — use Expandable Trace; wrapping one linear sequence in this pattern adds structure with nothing to show for it.
- When "sub-agents" are actually just sequential steps of one process dressed up as separate agents — if they run one after another, they read better as a single trace.

## Anatomy
- Root header: an aggregate status line ("3 agents working" while running, "Done — 3/3 complete" once finished) with a count.
- Per-agent row: a status icon (queued/running/done/error), the agent's name or role, a short current-step label, elapsed time, and an expand chevron.
- Expanded body: that agent's own step list, in the same step-row language as Expandable Trace.

## Behavior
- Each row updates independently — one agent completing, failing, or still running has no effect on any other row's state or label.
- The root header aggregates live: it reflects "N agents working" while any are active, and collapses to a static summary once all have resolved.
- Expanding one row never collapses another — several can be open simultaneously, since the agents themselves are independent.
- A failed sub-agent's row gets a distinct error tint and icon and stays visible rather than disappearing, so the user knows it needs attention.

## Content guidelines
- Agent names are short role labels ("Research agent", "Code agent"), not full descriptions of what they're doing — the current-step label carries that.
- Current-step labels follow the same present-tense, short-phrase convention as Thinking Loader and Tool Call Chip ("Reading docs", not "It is currently reading the documentation").

## Accessibility
- Each row's expand toggle exposes \`aria-expanded\`.
- Status changes are announced through a single \`aria-live="polite"\` region on the root header, not per row, so simultaneous updates from several agents don't spam assistive tech.
- Status is conveyed by icon and text together, never color alone, since red/green distinctions must survive a color-blind or grayscale viewing.

## Related patterns
- Expandable Trace is the single-agent, linear counterpart this pattern extends to parallel work.
- Tool Call Chip is what an individual step inside one agent's row typically looks like when that step is a specific tool call.
`;
