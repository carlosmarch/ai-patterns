export const pattern = `# Stream of Thought

## Summary
The model's reasoning streams inline as a timeline of short steps, each a headline and a few lines of prose, under a live header. The header shows the title of the current step sliding into place and a ticking timer, like Thinking Loader. When the answer starts, the timeline collapses into a "Thought for Ns" toggle that expands into the full trace, like Expandable Trace. One component covers the wait, the live reasoning and the record afterwards.

## When to use
- Reasoning models that think for several seconds or more before answering. Watching the thoughts arrive makes the wait feel shorter and shows that work is happening.
- When the reasoning arrives live as prose (or a live summary of it) that falls into a few named beats.
- When people may want to check how the model reached its conclusion, but most only want the answer.

## When not to use
- When there is nothing real to stream. Don't invent placeholder thoughts to fill a wait; use Thinking Loader.
- When the steps are discrete tool actions with results (search, read, edit) and no prose. Expandable Trace or Task List say that more plainly.
- When the raw reasoning may contain content you can't show users (policy text, system prompt details). Stream a summary, or don't show it at all.

## Anatomy
- **Header toggle:** an icon, a label and a chevron; the whole row is the toggle.
  - While thinking: a brain icon, the current step's title shimmering and sliding in from below, and an elapsed-seconds counter on the right whose digits roll as they change.
  - When done: a sparkle icon and "Thought for Ns". The counter is gone.
- **Timeline:** one step per thought, joined by a thin vertical line. Each step has a mark, a short headline and muted body text.
- **Step mark:** a pulsing dot on the step that is still streaming; a check on finished steps.
- **Live window:** while thinking, the timeline is capped to a few lines, with a fade at the top edge so older steps dissolve upward instead of being cut off.
- **The answer:** below and outside the component, in full-contrast text.

## Behavior
- Open by default while thinking. New text appends at the bottom and the window stays scrolled to the newest line. If the person scrolls up inside it, stop auto-scrolling until they return to the bottom.
- When a new step starts, its title replaces the header label, and the previous step's dot turns into a check.
- The timer counts whole seconds from when thinking started. It freezes when thinking ends, and that number becomes "Thought for Ns". Pass the server's duration instead when you have it.
- When thinking ends, the last dot turns into a check and the timeline collapses with a short height animation. The answer then fades in below.
- After completion, the expanded timeline shows every step in full, with no height cap and no fade.
- If the person toggles the header at any point, keep their choice. Don't auto-collapse something they just opened, or reopen something they closed.
- Text appears in small chunks (words or tokens), following the model's rhythm, not letter by letter at a fixed speed.
- With reduced motion, drop the shimmer and the height animation; the text still streams and the labels still change.

## Content guidelines
- Step titles are short gerund phrases ("Weighing the options"), at most about five words. They double as the live header label, so they must fit on one line.
- Body text can be first person and informal. It's thinking, not the answer, and should read that way.
- Use the real elapsed time ("Thought for 9s"). Round to whole seconds, and switch to minutes past 60s ("Thought for 2m").
- The answer must not depend on the reasoning: it repeats any conclusion it needs, so nobody has to expand the trace to understand it.

## Accessibility
- The header is a real \`button\` with \`aria-expanded\` and \`aria-controls\` pointing at the timeline.
- Announce state through a visually hidden \`role="status"\` ("Thinking", then "Thought for N seconds"). Hide the sliding label and the ticking timer from assistive tech, and don't make the streaming body a live region: announcing every token or second is unusable.
- Mark the timeline \`aria-busy="true"\` while it streams, and make the live window focusable so keyboard users can scroll it.
- Use an ordered list for the steps. Shimmer and pulse are decorative; labels must read at sufficient contrast without them.

## Related patterns
- **Thinking Loader** — Use it instead when there is no reasoning text to show, just the live header.
- **Expandable Trace** — Use it instead when the reasoning is already complete and doesn't need to stream.
- **Streaming Text** — Use it as well below for the answer itself as it streams in.
`;
