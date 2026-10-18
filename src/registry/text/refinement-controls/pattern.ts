export const pattern = `# Refinement Controls

## Summary
A row of one-tap adjustments — "Rephrase", "Shorten", "More formal", "Bulletize" — plus a free-form "Format this by…" field, attached directly to an AI output. Users tend to stop at the first output because they don't know it can be improved, or don't know how to ask. Refinement controls make iteration visible and cheap: they name the most useful next moves and turn each into a single click, while every result is kept as a version the user can step back through.

## When to use
- When AI output is a starting point that usually benefits from adjustment — drafted prose, summaries, rewrites, generated copy.
- When users are new to AI features and don't yet know what they can ask for; the chips teach the vocabulary of refinement by example.
- When the common adjustments are predictable (length, tone, structure) and can be named in one or two words.

## When not to use
- When the output is deterministic and has a single correct answer (a unit conversion, a lookup, a calculation) — offering "Rephrase" or "More formal" implies the answer is a matter of taste.
- When the edit is scoped to part of the output — use Selection Actions so the change is anchored to the highlighted passage rather than rewriting everything.
- When the user is mid-conversation and a follow-up message is the natural way to ask for changes; a chat composer already serves as the free-form field.

## Anatomy
- The output itself, with a small header naming which version is showing ("Original draft", or the refinement that produced it) and, once there's more than one version, a "‹ 2 / 3 ›" stepper.
- A refinement bar docked under the output:
  - Primary chips, each with an icon and a short label — the two or three adjustments most people want (e.g. "Match writing style", "Rephrase").
  - A "More" chip that opens a menu upward with the long tail of adjustments (Shorten, Elaborate, More formal, Bulletize, Summarize), each with its own icon.
  - A free-form input with an example-led placeholder ("Format this by…") and a send button for anything the presets don't cover.
- A transient status line ("Shortening…") shown over the output while a refinement runs.

## Behavior
- Selecting a chip, a menu item, or submitting the input applies that instruction to the version currently shown, not always to the original — refinements compound (Shorten, then More formal).
- While a refinement runs, the output dims, the status line names the action in progress, and all controls are disabled so requests can't race each other.
- Each result is appended as a new version and becomes the visible one. Earlier versions are never overwritten; the stepper moves between them. Refining from an earlier version still appends to the end of the history rather than discarding later versions.
- The "More" menu opens above its trigger (the bar sits at the bottom of the surface), closes on selection, outside click, Escape, or Tab, and returns focus to the trigger when closed by keyboard or selection.
- The send button stays disabled until the input has non-whitespace text; submitting clears the field.
- The version transition is a short crossfade so the user perceives that the text changed, without slowing down rapid iteration.

## Content guidelines
- Chip labels are one or two words, verbs or comparatives: "Shorten", "Elaborate", "More formal". They should describe the result, not the mechanism.
- Promote to primary chips only the adjustments with the highest usage; put the rest under "More". Five to seven total presets is plenty — beyond that the menu becomes a settings panel.
- The input placeholder should model how to write an instruction ("Format this by…", "Make it…"), not just say "Type here".
- The in-progress status uses the present progressive of the chosen action ("Making it more formal…") so users can confirm the click registered what they meant.
- Label each version with the refinement that made it, so stepping back reads as a history of decisions rather than anonymous numbers.

## Accessibility
- The chip row has \`role="toolbar"\` with an \`aria-label\`; every chip is a real \`<button>\` with a visible text label (icons are \`aria-hidden\`).
- "More" is a menu button: \`aria-haspopup="menu"\`, \`aria-expanded\`, and \`aria-controls\` while open. The menu has \`role="menu"\`, items have \`role="menuitem"\`, focus moves to the first item on open, Arrow keys / Home / End move between items, and Escape closes and returns focus to the trigger.
- The output region sets \`aria-busy\` while a refinement is generating, and the status line lives in an \`aria-live="polite"\` region so screen reader users hear "Shortening…" and know when it finishes.
- The free-form input has its own \`aria-label\` since its only visible label is the placeholder; the icon-only send and stepper buttons have \`aria-label\`s.

## Related patterns
- Selection Actions — the same idea scoped to a highlighted passage; pair them so users can refine the whole output or just a sentence.
- Chat Bubble with Actions — its version stepper and regenerate action cover re-running the same prompt; Refinement Controls change the prompt in a named direction instead.
- Follow-Up List — suggests the next question to ask; Refinement Controls suggest the next change to make to the current answer.
`;
