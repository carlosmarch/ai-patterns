export const pattern = `# Criteria Determination

## Summary
A field that shows an AI-derived verdict ("Applies", "Does not apply", "Uncertain") alongside the criteria it was derived from, grouped by evidence status: Missing information, Not met, and Met. Missing criteria are posed as Yes/No questions so the user can close the gaps the AI couldn't, and the verdict updates as they answer.

## When to use
- Rule-based classification where the AI checks a subject against a list of requirements: regulatory applicability, eligibility, compliance obligations, policy coverage.
- When the AI can verify some criteria from evidence but needs a human to confirm the rest.
- When reviewers must be able to audit why a verdict was reached, not just see it.

## When not to use
- Free-form judgments with no enumerable criteria — use a confidence indicator with a reason instead.
- A single yes/no question — ask it directly; the grouping adds nothing.
- Criteria lists that run to dozens of items — summarise and link to a full checklist view.

## Anatomy
- Determination select: status dot, verdict label, an "AI" badge (or "Edited" once the user overrides it), chevron.
- Criteria field, grouped in fixed order:
  - Missing information: highlighted (warning-tinted) cards with the requirement, an optional "Show details" disclosure quoting the source text, and Yes / No answer buttons.
  - Not met: neutral rows labelled "Requires" + the requirement.
  - Met: same neutral rows.
- Info hints on each field and group heading explaining what it means.

## Behavior
- The verdict is derived: any missing criterion keeps it Uncertain; once all are answered, any Not met makes it Does not apply; otherwise Applies.
- Answering Yes moves a criterion to Met; No moves it to Not met. The card animates into its new group and the verdict label cross-fades to the new value.
- Empty groups are hidden. When the last missing criterion is answered, the Missing information group disappears.
- The user can override the verdict from the select. The AI badge is replaced by "Edited"; the AI's derived value stays marked as "AI suggestion" in the menu, and picking it again clears the override.
- Details are collapsed by default; expanding one card does not affect the others.

## Content guidelines
- Phrase each criterion as a statement that is true or false of the subject ("Owns or operates a public pool or spa in the US"), so Yes/No answers read naturally.
- Details should quote or closely paraphrase the source rule, not the AI's reasoning.
- Keep verdict labels to two or three words; colour reinforces them but never carries the meaning alone.

## Accessibility
- The select is a button with \`aria-haspopup="listbox"\` and \`aria-expanded\`; options use \`role="option"\` with \`aria-selected\`. Escape and outside click close it.
- "Show details" is a disclosure button with \`aria-expanded\` and \`aria-controls\`.
- Yes/No buttons sit in a group labelled with the criterion so screen readers announce what is being answered.
- Warning tint on missing cards must keep text at WCAG AA contrast in light and dark themes.
- Respect \`prefers-reduced-motion\` by removing layout and cross-fade animations.

## Related patterns
- Confidence Indicator — for a single verdict without enumerable criteria.
- Human in the Loop Question — for collecting a richer answer mid-task.
- Source Trust Card — for showing where a criterion's evidence came from.
`;
