export const pattern = `# Tool Call Chip

## Summary
A compact inline pill shown while a specific, named tool call is in flight — a verb, its target, and a spinner — that resolves in place into a short result summary the instant the call finishes. Unlike the Thinking Loader's generic "the system is working" signal, this names the concrete action actually happening right now.

## When to use
- The agent is mid-call on a specific tool or function (a web search, a file read, a code execution, an API request) and the target is worth naming (the query, the filename, the endpoint).
- Inside an Expandable Trace or a message stream, as the live version of what becomes a completed step once resolved.

## When not to use
- For the overall "agent is working" state when no single tool call is active — use a Thinking Loader for that; don't invent a fake tool name to fill the gap.
- Stacked several deep for sub-steps of one logical call. One chip per call actually in flight — batch or fold finished ones into a trace instead of leaving a pile of chips on screen.
- When the target is sensitive and shouldn't be echoed verbatim (e.g. a raw credential) — summarize instead of printing it raw.

## Anatomy
- Icon: represents the tool's kind (search, file, code, network, ...).
- Label: a present-tense verb plus its target, e.g. \`Searching "tailwind v4 changelog"\`.
- State indicator: a small spinner while running; swaps to a check icon on success or an alert icon on failure.
- Resolved label: replaces the in-progress label with a brief result summary, e.g. \`Searched — 4 results\`.

## Behavior
- Appears the instant the call is dispatched — don't wait for a response to show that work has started.
- The target truncates with an ellipsis if it's long; never wraps to a second line.
- On completion, the spinner swaps to a check (or alert, on error) and the label updates to the result summary in the same chip — it does not get replaced by a new element.
- Once resolved, the chip stays visible as part of the record rather than vanishing; it commonly becomes one row of a subsequent Expandable Trace.
- Multiple sequential calls in one turn render as multiple chips in order, each independently transitioning from running to resolved.

## Content guidelines
- Verb + straight-quoted target, one line: \`Reading "component.tsx"\`, \`Calling "get_weather"\`.
- Keep the resolved summary equally short — a count or outcome, not a restatement of the whole result.
- Stay truthful: never show a tool name or target that doesn't match what's actually running.

## Accessibility
- Wrap the label and state indicator in an \`aria-live="polite"\` region so the running → resolved transition is announced.
- Don't rely on the spinner-to-check swap alone to signal completion — the label text change must carry the same meaning for non-visual users.
- Give the icon \`aria-hidden\` and let the text label carry the accessible name.

## Related patterns
- Thinking Loader is the generic counterpart for when no specific tool call is active.
- Expandable Trace is where a sequence of resolved chips typically ends up once a turn completes.
- Tool Approval is the gate that, when required, appears before a chip like this starts running.
`;
