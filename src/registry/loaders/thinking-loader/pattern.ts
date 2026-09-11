export const pattern = `# Thinking Loader

## Summary
An inline status indicator shown while an agent is working on a response: a small looping glyph, a shimmering verb label, and a live elapsed-time counter. It tells the user the system is alive and roughly how long it has been going, without claiming a specific progress percentage it doesn't have.

## When to use
- Any moment an agent or background process is working and the duration is unknown or variable (LLM generation, tool calls, search, a long-running job).
- As the "in progress" half of a working → done sequence (see Related).

## When not to use
- When you actually know a determinate progress percentage — use a progress bar instead, it's more honest and more useful.
- As a permanent decoration left running after the work is actually done. The instant work finishes, replace this component with a completed-state summary; do not just freeze or hide it in place.
- More than one active at a time in the same conversation/view. One "the system is working" signal per turn.

## Anatomy
- Brain icon: a dim base glyph with a brighter sheen swept across it on a loop.
- Shimmering label: a present-participle verb or short phrase describing the current activity, cycling through a small set of synonyms ("Thinking", "Reasoning", "Pondering", ...) on a timer.
- Elapsed-time counter: seconds with one decimal place, counting up from 0.0s.

## Behavior
- Starts counting the instant work begins.
- The label cycles to the next word in its list every couple of seconds, fading/sliding out the old word and in the new one — the shimmer alone communicates "still working" even between word changes.
- If real sub-step information is available ("Thinking" → "Searching" → "Writing"), drive the label from that instead of the generic cycle.
- The counter's changed digit animates in place (a short roll/slide) rather than the whole number re-rendering, so it doesn't read as flicker.
- On completion, replace the whole component with a result — for an agent trace, that's typically the collapsed header of an Expandable Trace ("Thought for 4 seconds").

## Content guidelines
- Each word is one or two words, present-participle or short verb phrase, no punctuation.
- Keep it truthful: don't cycle through "Searching" unless a search is actually happening.

## Accessibility
- Wrap in an \`aria-live="polite"\` region so screen readers announce label changes without interrupting other content.
- Don't rely on the animated counter alone to signal "still working" for assistive tech — the live-region label carries that meaning.
- Respect \`prefers-reduced-motion\`: keep the counter (it's informational) but reduce or remove the looping icon/shimmer motion.

## Related patterns
- Expandable Trace is the "done" counterpart — replace this component with that one the moment work completes.
`;
