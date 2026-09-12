export const pattern = `# Selection Actions

## Summary
A floating toolbar that appears when the user highlights a passage of agent-written text, letting them describe an edit, ask for an explanation, or request an improvement without leaving the reading flow. Submitting an action replaces the highlight with a live, editable suggestion — shown inline with a subtle highlight — that the user keeps, discards, or retries before it lands in the text.

## When to use
- Over any block of agent-generated text the user is expected to revise in place — a drafted email, a generated paragraph, a summary — rather than regenerating the whole response.
- When edits are naturally scoped to a phrase or sentence rather than the whole document, so anchoring the toolbar to the selection reads more directly than a document-level "regenerate" action.
- When the user benefits from a quick, low-commitment way to ask "why did you write this" (Explain) alongside ways to change it (Improve, a custom instruction, or a quick-edit shortcut).

## When not to use
- On text the user can't or shouldn't edit (system messages, another person's message, read-only citations) — offering a rewrite toolbar implies the content is theirs to change.
- For whole-document actions like "regenerate this response" or "translate the whole thing" — those belong on a persistent action bar for the message, not a selection-anchored popup.
- On very short text (a label, a single word) where a highlight-triggered toolbar has more visual weight than the content it's acting on.

## Anatomy
- A pill-shaped toolbar anchored below the current selection: a borderless "Describe edits" text field on the left, a vertical divider, an "Explain" button (circle-help icon), another divider, an "Improve" button (sparkle icon), a final divider, and a chevron that expands a short list of quick edits (e.g. "Fix grammar," "Shorten," "Make more formal").
- Once an edit is requested, the toolbar is replaced by the candidate text rendered inline with a highlight (a muted pulsing highlight while generating, a colored highlight once ready) directly in place of the original passage.
- Below the candidate, a second pill toolbar appears: a filled "Keep" button, a plain "Discard" button, and a small icon-only "Retry" button, separated the same way as the first toolbar.

## Behavior
- The toolbar appears only once a selection is finalized (on pointer-up or after a keyboard selection), not while the user is still dragging — so it doesn't jitter mid-drag.
- Clicking Explain, Improve, a quick edit, or submitting the instruction field immediately swaps the selection for the review state: the original selection is replaced by an inline highlighted placeholder while the request is in flight, then by the candidate text once it resolves.
- Explain does not enter the review flow — it opens an inline answer panel below the toolbar and leaves the original text untouched.
- While reviewing a candidate, new selections are disabled; the user must Keep or Discard first.
- Keep commits the candidate into the underlying text and closes the toolbar. Discard reverts to the original passage with no trace of the attempt. Retry re-runs the same instruction and shows the loading highlight again without discarding the review state.
- Clicking outside the toolbar and the selected passage, or pressing Escape, dismisses the toolbar and clears the selection without making any change.

## Content guidelines
- Keep quick-edit labels as short verb phrases ("Fix grammar," "Shorten") the user can scan in under a second — they're shortcuts, not full instructions.
- The Explain response should describe intent or reasoning ("this sets the deadline because—"), not just restate the sentence in other words.
- Default the Improve action to a clear, generic instruction ("improve clarity and flow") so it's useful without the user typing anything.

## Accessibility
- Both toolbars have \`role="toolbar"\` with a descriptive \`aria-label\`, and the instruction field carries its own \`aria-label\` since its only visible label is placeholder text.
- The candidate highlight sets \`aria-busy\` while generating so assistive tech doesn't announce placeholder content as final.
- The explanation panel uses \`role="status"\` so screen reader users hear the answer as it appears without needing to navigate to it.
- Escape and outside-click both dismiss the toolbar, matching how any other transient popover on the page behaves.

## Related patterns
- Chat Bubble with Actions covers whole-message actions (regenerate, edit-and-resubmit) — reach for Selection Actions when the edit is scoped to part of a message instead of the whole thing.
- Inline Citation uses the same anchored-popover positioning technique for a hover-triggered footnote instead of a click-triggered action toolbar.
`;
