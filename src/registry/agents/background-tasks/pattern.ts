export const pattern = `# Background Tasks Drawer

## Summary
A side drawer listing the work an agent has kicked off in the background — sub-agents, long shell commands, builds — split into a live "Running" section and a collapsible "Finished" history. Running tasks tick in real time (elapsed time, token and tool-use counts, a shimmering current-activity label) and can be stopped; finished tasks collapse to one line and expand to show the command and its output. It lets the user keep chatting while still being able to check on, inspect, or cancel what's happening off to the side.

## When to use
- An agent runs tasks that outlive a single turn or run in parallel with the conversation (a sub-agent, a dev server, a test run, an install).
- The user needs a single place to answer "what is still running, and what did it do?" without scrolling back through the transcript.
- Tasks can be cancelled independently and the user should be able to do so without interrupting the main agent.

## When not to use
- For steps that run inline and finish within the current response — use Expandable Trace or Tool Call Chip in the message instead.
- To visualise an orchestrator's tree of sub-agents as part of the answer itself — use Multi-Agent Trace; this drawer is a flat, app-level monitor, not a message.
- For a single long command whose output the user is actively watching — use Terminal Stream inline.

## Anatomy
- Header: title ("Background tasks"), a clear-finished action, an expand/collapse-width toggle, and a close button.
- Running section: a label and one card per active task, each with
  - title,
  - kind label (Agent / Bash) with a live elapsed timer,
  - a compact stats line (model, tokens, tool uses) ending in the current activity, rendered with a shimmer,
  - a "View transcript" link for agent tasks,
  - a stop button,
  - a thin sweeping progress line along the bottom edge to signal liveness.
- Finished section: a disclosure header with a count ("Finished 3"), then one row per task with title, kind, outcome (Completed / Failed / Stopped) and final duration; expanding a row reveals the command and its output in monospace blocks.
- Empty state: a dashed "Nothing running right now" placeholder under Running.

## Behavior
- The drawer slides in from the right edge and pushes no content — it overlays the app. Escape and the close button dismiss it; closing never stops tasks.
- Running cards update in place every second; the activity label crossfades when it changes rather than jumping.
- When a task finishes, fails, or is stopped, its card animates out of Running and into the top of Finished (shared layout), so the user can follow where it went.
- Stopping a task is immediate and moves it to Finished with a "Stopped" outcome; no confirmation, since nothing is destroyed.
- "Clear finished" removes only finished rows and is disabled when there are none.
- The Finished section can be collapsed; finished rows are collapsed by default and only expand on click.
- The expand toggle widens the drawer to the full container for reading long output.

## Content guidelines
- Task titles describe the goal in a few words ("Install dependencies", "Baseline build on origin/main"), not the raw command — the command lives in the details.
- Activity labels are short, present-tense phrases ("Running a command", "Editing component.tsx"), matching Thinking Loader and Tool Call Chip.
- Stats are terse and scannable: "54.4k tokens", "6 tool uses". Durations use "59s" under a minute and "2m 05s" above.
- Outcome words are past tense and consistent: Completed, Failed, Stopped.

## Accessibility
- The drawer is a labelled landmark (\`aria-label\` = its title) and receives focus (without scrolling the page) when the user opens it — never on initial render, so a drawer that starts open doesn't steal focus or jump the page on load; Escape closes it.
- A single \`aria-live="polite"\` region announces the running count, so per-second ticks don't flood assistive tech.
- Every icon-only control (clear, expand, close, stop) has an \`aria-label\` naming the action and, for stop, the task.
- Finished rows expose \`aria-expanded\`; the Finished disclosure does too.
- Outcome is conveyed by text plus icon, never color alone.
- Respect \`prefers-reduced-motion\`: the drawer fades instead of sliding.

## Related patterns
- Multi-Agent Trace shows parallel sub-agents inline in a response; this drawer is the persistent, app-level view of the same kind of work.
- Terminal Stream is what a single shell task's output looks like when watched live.
- Stop Generation Button handles cancelling the main response; the stop control here cancels one background task.
- Thinking Loader supplies the shimmer language used for the live activity label.
`;
