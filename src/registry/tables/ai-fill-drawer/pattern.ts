export const pattern = `# AI Fill Drawer

## Summary
A record-details drawer that lists a record's fields as key/value rows and lets the model fill the empty values. "Fill with AI" fills every empty field at once. Each value arrives on its own as a marked suggestion, with the source it came from, and only becomes the record's real value once the user accepts or edits it. Values the user already set are never touched.

## When to use
- Enrichment: CRM accounts, contacts, products, tickets or assets where many fields can be found from the web, documents or connected tools.
- Records opened from a table row, where the drawer keeps the table in view for context.
- Any form where most fields are guessable and the user's job is to check, not type.

## When not to use
- Fields whose value is a decision, not a fact: owner, stage, price, approval. Mark them not fillable.
- Identifiers and legal or regulated data (tax IDs, contract terms) where a plausible wrong value is worse than an empty one.
- Bulk enrichment of hundreds of rows. Run a background job and review the result in the table instead.
- Long free-text fields. A drafted description or note belongs in an editor with Refinement Controls, not a one-line value cell.

## Anatomy
- **Header** — record title, a one-line subtitle (type, created date), close.
- **Action bar** — "Fill with AI" (becomes "Stop" while running) and a status line ("4 empty", "Filling 3 fields…", "All fields have values").
- **Field list** — a definition list: muted key on the left, value on the right. A row can be:
  - **Set** — plain value, click to edit.
  - **Empty** — muted "Empty"; on hover or focus, a per-field ✦ fill button.
  - **Filling** — a pulsing skeleton bar in place of the value.
  - **Suggested** — a tinted row, ✦ before the value, "from <source>" underneath, and accept ✓ / reject × buttons.
  - **Not found** — italic "Couldn't find a value" with a retry button.
- **Review footer** — slides up once filling ends and suggestions remain: "3 AI values to review · Reject all · Accept all".

## Behavior
- "Fill with AI" requests every empty, fillable field in parallel. Rows resolve independently, in whatever order the answers arrive. Don't hold all of them back until the slowest finishes.
- Only empty fields are filled. A value the user set — or accepted — is never overwritten by a later fill.
- Stop cancels the run: rows still filling go back to Empty, and late answers from that run are ignored. Suggestions that already arrived stay.
- A suggestion is not the record's value until it is accepted. \`onChange\` fires only on accept or on an edit.
- Accept turns the row into a plain set value. Reject empties it again and leaves it fillable.
- Clicking any value, including a suggestion, edits it inline. Enter or blur saves, Esc cancels. Saving an edited suggestion counts as accepting the user's value.
- When the model finds nothing, say so ("Couldn't find a value") instead of guessing. Retry is per field.
- The review footer is hidden while filling, so Accept all can't accept a half-finished set.
- Esc closes the drawer, unless focus is in a field editor.

## Content guidelines
- Keys are short nouns in the record's own vocabulary ("Headquarters", not "Company HQ location").
- Suggested values use the same format the field would use if typed: ranges like "1,001–5,000", bare domains, no sentences.
- Always show a source when the model has one — a page, a document, a tool. "Web search" is acceptable; no source at all should be rare.
- The status line counts, never apologizes: "2 empty", not "We couldn't fill 2 fields".

## Accessibility
- Fields are a \`<dl>\` of \`<dt>\`/\`<dd>\` pairs, so screen readers announce key and value together.
- Each value is a button labelled "Edit <field>"; the inline input is labelled by its key.
- Accept, reject, fill and retry are icon buttons with full labels ("Accept AI value for Industry").
- The ✦ marker has an accessible label ("AI suggestion"), and the tinted row is never the only signal — the accept/reject buttons and the source line also mark it.
- The status line is a polite live region, so progress ("Filling 3 fields…") and completion are announced.
- The drawer takes focus when opened. With \`prefers-reduced-motion\`, it fades instead of sliding.

## Related patterns
- **Describe Filters** — Use it as well, since it's the table this drawer is usually opened from.
- **Confidence Indicator** — Use it as well next to a suggestion when the model can report how sure it is.
- **Source Trust Card** — Use it as well to expand a suggestion's source into a full preview.
- **Background Tasks Drawer** — Use it instead when the drawer tracks long-running work rather than suggested values.
`;
