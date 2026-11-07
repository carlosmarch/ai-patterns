export const pattern = `# Stream of Thought

## Summary
The model's reasoning streams inline, as prose, in a short fading window above where the answer will appear. A shimmering "Thinking" header sits on top. When the answer starts, the reasoning collapses into a one-line "Thought for Ns" toggle that anyone can reopen to read the whole thing.

## When to use
- Reasoning models that think for several seconds or more before they answer. Watching the thoughts arrive makes the wait feel shorter and shows that work is happening.
- When the reasoning is prose that the model produces live (or a live summary of it), not a list of discrete tool calls.
- When people may want to check how the model reached a conclusion, but most people only want the answer.

## When not to use
- For an ordered list of actions with a clear done state per step, such as search, read or edit. Use Expandable Trace or Task List.
- When there is nothing real to stream. Don't invent placeholder "thoughts" to fill a wait; use Thinking Loader.
- When the raw reasoning may contain content you can't show users (policy text, system prompt details). Stream a summary, or don't show it at all.

## Anatomy
- Header toggle: the label ("Thinking" with a shimmer while live, "Thought for Ns" when done) and a small chevron. The whole header is the toggle.
- Reasoning body: indented behind a thin vertical rule so it reads as secondary to the answer.
- Thought blocks: an optional short headline in a stronger weight, then muted body text. While streaming, only the latest block is still growing.
- Live window: while thinking, the body is capped to a few lines, with a fade at the top edge so older text dissolves upward instead of being cut off.
- The answer, below and outside the component, in full-contrast text.

## Behavior
- Open by default while thinking. New text appends at the bottom and the window stays scrolled to the newest line.
- If the person scrolls up inside the live window, stop auto-scrolling until they return to the bottom.
- When thinking ends, freeze the duration, swap the label to "Thought for Ns", and collapse the body with a short height animation. The answer then fades in below.
- Once expanded after completion, the body shows all the reasoning with no height cap and no fade.
- If the person toggles the header at any point, keep their choice. Don't auto-collapse something they just opened, or reopen something they closed.
- Text appears in small chunks (words or tokens), not letter by letter at a fixed speed, so the rhythm follows the model.
- With reduced motion, drop the shimmer and the height animation; the text still streams.

## Content guidelines
- Headlines are short gerund phrases ("Weighing the options"), at most about five words.
- Body text can be first person and informal. It's thinking, not the answer, and should read that way.
- Label the finished state with the real elapsed time ("Thought for 9s"). Round to whole seconds, and use minutes past 60s ("Thought for 2m").
- The answer must not depend on the reasoning: it repeats any conclusion it needs, so nobody has to expand the trace to understand it.

## Accessibility
- The header is a real \`button\` with \`aria-expanded\` and \`aria-controls\` pointing at the body.
- Put the label in a \`role="status"\` region so screen readers hear "Thinking" and then "Thought for Ns". Don't make the streaming body a live region; announcing every token is unusable.
- Mark the body \`aria-busy="true"\` while it streams. Make the live window focusable so keyboard users can scroll it.
- The shimmer is decorative. The label must be readable as plain text at sufficient contrast without it.

## Related patterns
- Thinking Loader is the minimal version, with a cycling label and no reasoning text.
- Expandable Trace is the step-by-step version for discrete actions.
- Streaming Text covers how the answer itself streams in below.
`;
