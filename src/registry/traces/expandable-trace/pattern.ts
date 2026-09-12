export const pattern = `# Expandable Trace

## Summary
A collapsed-by-default summary line ("Thought for N seconds") that expands into a checklist of the discrete steps an agent took to produce its answer. It gives curious users a way to audit the reasoning without forcing everyone to read it by default.

## When to use
- Right after an agent finishes a multi-step task (tool calls, reasoning, search, edits) and you want to offer transparency without cluttering the default view.
- When the steps have a natural, ordered sequence with a clear notion of "done" per step.

## When not to use
- For a single atomic action with no real sub-steps — there's nothing meaningful to expand into; just state the result.
- As a substitute for real error handling. If a step failed, show that explicitly as a distinct state on that step (not by silently omitting it).
- Auto-expanded by default in a dense feed. Default collapsed keeps the primary answer scannable; only auto-expand when the user asked to see reasoning, or in a dedicated debugging surface.

## Anatomy
- Header button: icon + "Thought for N seconds" + chevron. The entire header is the toggle target, not just the chevron.
- Collapsible body: a vertical list of steps, each with a completion mark, a short label, and optional trailing metadata (e.g. "6 sources").
- A connecting line between steps so they read as one continuous sequence, not disconnected items.

## Behavior
- Collapsed by default.
- Expand/collapse animates height smoothly rather than snapping instantly.
- The step list is a static historical record once rendered — it does not keep updating live. Use the Thinking Loader for the in-progress version of this information.
- The duration shown in the header is fixed once the run is complete; it does not keep counting like the Thinking Loader's timer does.

## Content guidelines
- Step labels are short, neutral action phrases ("Reading the uploaded document"), not first-person narration ("I read the uploaded document").
- Trailing metadata should be a single scannable fact, not another full sentence.

## Accessibility
- The header button needs \`aria-expanded\` reflecting current state.
- The whole component must be operable by keyboard (Enter/Space on the header toggles it).
- Never hide information the user needs to trust or act on the primary answer exclusively inside the collapsed trace — the answer must stand on its own without expanding this.

## Related patterns
- Thinking Loader is the "in progress" counterpart — this component is what it becomes once work finishes.
`;
