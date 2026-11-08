export const pattern = `# Response Actions

## Summary
A toolbar that stays under a finished answer: Copy, thumbs up and down, Share, and a Regenerate button with a menu of ways to try again. A thumbs-down opens a short panel asking what went wrong, so the rating comes with a reason the team can act on. Regenerate goes past "same prompt, new answer" with named alternatives, such as a more concise version or a different model, so people can get the answer they need without rewriting the prompt.

## When to use
- Long-form answers (explanations, drafts, research) where the reply is the deliverable and people copy, share or retry it.
- Products that collect answer-quality feedback and need reasons, not just a count of thumbs-downs.
- When there are a few useful, nameable ways to retry: another model, a shorter answer, more sources.

## When not to use
- Busy chat threads where every message has actions — use Chat Bubble with Actions, which hides its row until hover so the thread stays calm.
- Adjusting an answer's tone or length as an editing step — use Refinement Controls, which keeps each result as a version beside the original.
- Answers that can't be reproduced, like a one-off tool run with side effects; "Regenerate" would repeat the action, not just the text.

## Anatomy
- Toolbar under the answer, aligned with its text: Copy, Good response, Bad response, Share, Regenerate.
- Status text after the buttons: "Copied", "Link copied", "Thanks for the feedback".
- Regenerate split menu: "Try again" first, a divider, then the named options, each with a one-line hint.
- Feedback panel, which opens below the toolbar on a thumbs-down: a heading, reason chips (several can be picked), an optional note, a line saying what's sent, and Send (Skip when nothing is picked) and Close.

## Behavior
- The toolbar is visible at rest on the latest answer. On earlier answers it can fall back to hover or focus, as Chat Bubble with Actions does.
- Copy copies the answer as text and swaps its icon for a check for about two seconds. Share copies a link the same way and says "Link copied".
- Thumbs are a toggle pair: picking one clears the other, and picking the active one again clears the rating. The rating is recorded immediately; the reason is extra.
- Thumbs-down opens the feedback panel; thumbs-up just says thanks. Send or Skip closes the panel and thanks the person. Close or Escape closes it and keeps the rating.
- Regenerate opens its menu with focus on "Try again". Choosing an item closes the menu and starts the new answer. The button spins and reads "Regenerating…" until the answer arrives, and the rating resets, because it belonged to the old answer.
- Without extra options, Regenerate is a single icon button that just tries again.
- Keep earlier answers as versions (see Conversation Branches) rather than replacing them, so a regenerate never loses an answer someone liked.

## Content guidelines
- Name regenerate options by their result ("More concise", "Try with Fast model"), and give each a short hint about the trade-off.
- Keep to five or six feedback reasons, each a short phrase people recognise ("Not accurate", "Too long"). Put the most common first and include a safety reason.
- Say what feedback sends ("Sent with this conversation to help improve answers"), so no one shares more than they meant to.
- Status messages are two or three words, with no exclamation marks.

## Accessibility
- The row is a \`toolbar\` with an accessible name; every icon button has a label and a tooltip.
- Thumbs use \`aria-pressed\`; thumbs-down also sets \`aria-expanded\` while the feedback panel is open.
- Regenerate is a menu button (\`aria-haspopup="menu"\`, \`aria-expanded\`). Arrow keys, Home and End move through items, and Escape closes the menu and returns focus to the button.
- Status text is in a polite live region, so "Copied" is announced without moving focus.
- The feedback panel is a labelled region; reason chips are toggle buttons with \`aria-pressed\`.
- Icon swaps and the panel's height animation become a plain fade when the user prefers reduced motion.

## Related patterns
- **Chat Bubble with Actions** — Use it instead in chat threads, where per-message actions should stay hidden until hover.
- **Conversation Branches** — Defines how each regenerated answer is kept as a version people can switch between.
- **Refinement Controls** — Use it alongside for edits to the answer itself: shorter, more formal, as bullets.
- **Model Picker** — Use it for the conversation's model; the regenerate menu only switches the model for one retry.
`;
