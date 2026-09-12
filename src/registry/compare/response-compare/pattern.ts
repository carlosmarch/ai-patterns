export const pattern = `# Response Compare

## Summary
A side-by-side pair of full response panels answering the same prompt, letting the person read both in full and pick the one they prefer. It turns "regenerate and hope" into a direct A/B choice, and is the natural expansion of thumbs up/down when there are two concrete candidates to weigh instead of one.

## When to use
- Comparing two model outputs (different models, prompts, temperatures, or system prompts) for the same input, where quality is genuinely close and worth a human call.
- Eval/preference-collection tooling that needs an explicit, recorded choice between two candidates rather than a vague quality signal.
- Regeneration flows where showing the new answer next to the old one (instead of replacing it) helps the person decide which to keep.

## When not to use
- When one answer is obviously wrong (factual error, refusal, empty output) — surface an error state or a single corrected answer instead of asking someone to compare against garbage.
- More than two candidates at once. Side-by-side reading breaks down past two full-length responses; use a ranked list or a carousel instead.
- Low-stakes, low-effort answers (a one-line lookup, a short factual reply) where the ceremony of comparing outweighs the value of choosing.

## Anatomy
- Optional shared prompt header showing the question both responses are answering.
- Two response panels in a row (stacking vertically on narrow viewports): a label (model/version name or "Response A"/"Response B"), the response body, and a footer action row (Copy, Regenerate, "Choose this").
- A selection state: the chosen panel gets a visibly distinct border/highlight and a "Preferred" badge; the other panel recedes (reduced emphasis) without disappearing.

## Behavior
- Selecting a panel is a single choice between the two — choosing one always deselects the other; it is not two independent toggles.
- The choice is changeable: picking the other panel after the fact swaps the preferred state, it doesn't require undoing the first choice explicitly.
- Regenerating one panel only replaces that panel's content and clears any existing selection — it never touches the other panel's content.
- Both panels render at equal height with independently scrolling content, so a long response on one side doesn't push the other side's footer out of alignment or off-screen.
- Copy acts on that panel's response text only.

## Content guidelines
- Label panels neutrally ("Response A" / "Response B", or the model name) — avoid labels that imply a quality judgment before the person has read either one.
- Keep the "Choose this" action's label consistent across both panels; don't rephrase it based on which one you'd expect to win.

## Accessibility
- Group the two "Choose this" controls with \`role="radiogroup"\` and expose each as \`role="radio"\` with \`aria-checked\`, since exactly one of two mutually exclusive options can be selected.
- Each panel's response text must be reachable by screen reader in a sensible order — visual left/right placement shouldn't be the only thing separating them; label each region (e.g. \`aria-label="Response A"\`) so assistive tech announces which one is being read.
- The preferred badge's meaning must not rely on color/border alone — include visible text ("Preferred") or an icon with an accessible name.
- All actions (Copy, Regenerate, Choose this) must be reachable and operable by keyboard.

## Related patterns
- Chat Bubble with Actions — the single-response equivalent (thumbs up/down, Regenerate) for when there's one reply to judge rather than two to choose between.
- Diff Summary Card — a different kind of side-by-side comparison (before/after a batch of file edits) rather than two independent generations.
`;
