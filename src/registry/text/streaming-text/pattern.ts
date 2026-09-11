export const pattern = `# Streaming Text

## Summary
An answer that reveals itself progressively, as if it's being generated live, with inline source citations that appear at their exact position in the text — followed by quick actions and follow-up suggestions once the stream finishes.

## When to use
- Displaying an LLM-generated answer as it's actually produced (or a scripted approximation of that for a demo).
- Answers that cite specific sources inline, where the citation should feel attached to the exact claim it supports rather than listed separately at the end.

## When not to use
- Content the user already has in full, such as re-rendering a past message when a conversation reloads — show it fully formed, don't replay the reveal animation.
- Very long documents (multiple paragraphs+), where a full character-by-character reveal just delays reading. Consider revealing by paragraph/chunk instead.
- Attaching follow-up suggestion chips to content that isn't actually actionable — don't add them out of habit.

## Anatomy
- Streamed body text.
- Inline source chip(s): a small pill with an icon and a domain/source name, appearing inline mid-sentence.
- A cursor at the current write position, visible only while streaming.
- Post-stream action row: copy, thumbs up/down.
- Post-stream follow-up suggestion chips.

## Behavior
- Text reveals at a constant, fast pace — slow enough to read as "live", fast enough that it never feels like a gimmick or an artificial delay.
- A source chip appears as a whole unit at its position; it does not itself type in character by character.
- The cursor disappears the instant streaming completes.
- The action row and follow-up chips appear only after the stream finishes, never during — so they don't compete for attention while the user is still reading.
- Follow-up chips are optional next steps the user can click, not required actions.

## Content guidelines
- Citations are short (a domain or short source name), not a full URL.
- Follow-up suggestions are phrased as something the user would say next, in their voice ("Show trend chart"), not the agent's voice ("I can show a trend chart").

## Accessibility
- The streaming region should be an \`aria-live="polite"\` region; announcing every character is disruptive, so throttle or announce only on completion.
- Respect \`prefers-reduced-motion\` by rendering the full text immediately instead of animating the character reveal.
- The cursor is decorative — mark it \`aria-hidden\`.

## Related patterns
- Often follows a Thinking Loader / Expandable Trace pair: loader while working, trace for the audit trail, this component for the actual answer.
`;
