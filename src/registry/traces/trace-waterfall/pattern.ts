export const pattern = `# Trace Waterfall

## Summary
A timing view of one agent run. Each tool call, model call and wait is a row — name and argument on the left, a timing bar on a shared time axis in the middle, its duration on the right. A summary header gives the total run time and how it splits between tools, the model and waiting. Because waits (approvals, rate-limit backoff) often dwarf the real work, they're drawn compressed by default; a "Waiting to scale" toggle redraws every bar and tick with waits at their true length, so the user can see both where the work happened and where the time actually went.

## When to use
- Debugging or optimising an agent run: finding the slow tool, parallel calls that should overlap, or idle time between steps.
- Observability and admin surfaces (run history, eval dashboards, support tooling) where users ask "why did this take 75 seconds?".
- Runs with a handful to a few dozen spans that have reliable start times and durations.

## When not to use
- An end-user conversation that just needs "what did the agent do" — use Expandable Trace or Agent Run Card.
- Live progress while a run is still going — use Agent Run Card; a waterfall reads best once the timeline is known.
- Hundreds of spans or deep nesting — use a dedicated tracing tool with zoom, filtering and a span tree.
- Parallel sub-agents with their own plans — use Multi-Agent Trace.

## Anatomy
- Summary header: run title, total duration (large), a breakdown per span kind with a matching swatch, and the "Waiting to scale" toggle.
- Time axis: tick labels at round intervals across the bar column, with faint vertical gridlines running through the rows.
- Row: span name (monospace for tools, italic for waits) with a truncated argument, a timing bar, and a right-aligned duration.
- Bar styles by kind: tool calls solid, model calls a lighter fill, waits a dashed, hatched outline. Failed spans use the destructive color.
- Compression marks: a compressed wait bar carries a slanted break in its middle, and a dashed gridline marks the shortened interval on the axis.
- Footnote: one line saying whether waiting is compressed or to scale.

## Behavior
- Rows are in start order; overlapping bars show parallel calls (several reads fired at once).
- Compressed mode keeps all active time linear and shrinks each wait to a small fixed share of the active time (only if it's longer than that). Ticks that would fall inside a compressed wait are hidden, since that stretch of axis isn't linear.
- Toggling "Waiting to scale" animates every bar's position and width and every tick's position with one spring, so the user can follow each span to its new place. Ticks that no longer fit fade out; new ones fade in.
- On first render, bars grow in from their start position with a slight per-row stagger.
- The summary totals never change with the toggle — only the drawing does.
- Hovering a row highlights it; products with span details can open them on click.

## Content guidelines
- Name spans by what ran: the tool name (\`read_file\`, \`bash\`), the model, or the wait reason ("Awaiting approval", "Rate limit").
- Put the most identifying argument in the detail — a file path, a command, a search term — not the full payload.
- Durations: milliseconds under a second ("340ms"), one decimal under ten seconds ("2.8s"), whole seconds after, \`m ss\` past a minute.
- The toggle label describes the redraw, not a setting: "Waiting to scale".

## Accessibility
- The card is a \`<section>\` named by the run title; the summary breakdown is a description list.
- Rows are an ordered list. Each row has a visually hidden sentence ("bash npm test -- cart, started at 48s, took 13s, failed"); bars, axis and gridlines are \`aria-hidden\`.
- The toggle is a \`<button>\` with \`aria-pressed\`; the footnote is a polite live region so the change of scale is announced.
- Failure is never color-only — the hidden text says "failed" and the duration is tinted too.
- Respect \`prefers-reduced-motion\`: no grow-in or spring; bars and ticks jump to their new positions.

## Related patterns
- Agent Run Card — the live, glanceable view of the same run.
- Expandable Trace — a readable step log without timing.
- Multi-Agent Trace — parallel sub-agents, each with its own steps.
- Background Tasks Drawer — monitoring several runs at once.
`;
