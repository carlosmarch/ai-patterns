export const pattern = `# Agent Run Card

## Summary
A compact status card for a single agent run. The header names the run and shows a running timer; below it, the current step reads as a present-continuous headline ("Running checkout tests"), a segmented progress bar shows one segment per planned step, and a list of finished steps stacks up underneath — newest on top — as the agent reads files, edits code, runs tests and pushes a fix. Each finished row carries a kind icon, a past-tense label, a short result fact and how long it took.

## When to use
- An agent is working through a concrete, tool-driven run (a bug fix, a migration, a code change) and the user wants a glanceable "where is it now, how long has it been, what has it done" view.
- The run can live inline in a conversation, a PR, a notification or a dashboard tile where space is tight.
- Steps are discrete actions with a result worth one fact: lines read, a diff size, a test count, a commit hash.

## When not to use
- The agent's plan, written up front as outcomes rather than actions — use Task List.
- The full, inspectable log of reasoning and tool calls — use Expandable Trace; the card summarises, it doesn't replace the trace.
- Several runs at once in a side panel with stop controls — use Background Tasks Drawer.
- Parallel sub-agents, each with their own steps — use Multi-Agent Trace.
- A single short operation with no meaningful steps — use Thinking Loader or Tool Call Chip.

## Anatomy
- Container: a bordered, rounded card, sized for a narrow column.
- Header row: a run glyph (spinning arc while running, filled check when complete), the run title (muted, truncated) and a monospace timer (\`m:ss\`) aligned right.
- Current step: a single-line, medium-weight headline using the step's present-continuous label; swaps to a done label when the run finishes.
- Segmented progress bar: one segment per step in the plan. Finished segments fill solid; a failed one fills in the destructive color; the running segment shows a light sweeping across it; pending segments are an empty track.
- Finished steps list: separated by a divider, newest first. Each row has a kind icon (read, edit, test, command, push) badged with a small check or cross, a past-tense label, an optional result fact in monospace, and the step's duration.
- Overflow control: after a handful of rows, older ones collapse behind "N earlier steps".

## Behavior
- The timer ticks once per second while the run is active and stops on completion; it shows total run time, not per-step time.
- When a step finishes, its segment fills left to right, the headline slides up to the next step, and the finished row drops into the top of the list with a short height-and-fade spring, pushing older rows down.
- The agent can revise its plan mid-run. After a failing test, a fix and a re-run are inserted before the remaining steps: new segments grow into the bar and existing ones re-flow, without resetting finished ones.
- A failed step stays in the history with a cross badge and its failure fact ("1 failed") — a later success doesn't erase it.
- Steps run one at a time; at most one segment shows the running sweep.
- When every step is finished, the glyph pops to a check, the headline shows the done label, and the card stays as a record of the run.
- Rows are summaries; if the product has a trace, a row may link to that step's detail, but the card itself stays read-only.

## Content guidelines
- Run title: what the run is for, as an imperative outcome — "Fix flaky checkout test", not "Agent run #42".
- Current step: present continuous, naming the object — "Reading cart.ts", "Running checkout tests".
- Finished rows: past tense of the same action — "Read cart.ts", "Edited cart.ts", "Pushed fix/checkout-rounding".
- Result facts: one short, scannable fact per row — "212 lines", "+9 −3", "24 passed", "1 failed", a short commit hash. Omit rather than pad.
- Durations: whole seconds under a minute ("8s"), \`m:ss\` beyond.

## Accessibility
- The card is a \`<section>\` named after the run ("Agent run: Fix flaky checkout test").
- Only the current-step headline is a polite live region, so step changes are announced while the ticking timer stays silent; the timer's visible text is \`aria-hidden\` with an equivalent visually hidden label.
- The segmented bar is a \`role="progressbar"\` with \`aria-valuenow\`/\`aria-valuemax\` in steps and an \`aria-valuetext\` such as "3 of 7 steps finished".
- The finished list is an ordered list whose name includes progress; each row prefixes visually hidden "Done:" or "Failed:" — the badge is decorative.
- The overflow toggle is a real button with \`aria-expanded\`.
- Failure is never color-only: failed rows show a cross badge and a textual fact.
- Respect \`prefers-reduced-motion\`: no spinning glyph or sweeping segment (a static partial fill marks the running step), and rows and headlines cross-fade instead of sliding.

## Related patterns
- Task List — the agent's plan as outcomes; pair it with this card for the actions taken.
- Expandable Trace — the detailed log behind each finished row.
- Background Tasks Drawer — for monitoring several runs at once, with stop controls.
- Tool Call Chip — a single tool call shown inline in a message.
- Terminal Stream — the raw output of a command step.
`;
