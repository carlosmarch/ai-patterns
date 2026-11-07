export const pattern = `# Model Picker

## Summary
A compact chip in the composer that opens a list of models, each with a one-line description of what it is good at, plus an optional extended-thinking switch. It lets users trade speed for capability per message without leaving the prompt.

## When to use
- Products that offer more than one model or reasoning mode, and where the choice changes the result in a way users can feel (speed, depth, cost).
- Power-user surfaces — chat, coding assistants, research tools — where people switch models between tasks.
- Plans that unlock better models, so locked options double as an upgrade path.

## When not to use
- A single model, or models that differ only in ways users can't perceive. Route automatically instead of asking.
- Consumer surfaces where the choice would be noise. Offer an "auto" default and hide the picker behind settings.
- Choosing a provider or API key — that is configuration, not a per-message choice.

## Anatomy
- Trigger chip: the selected model's name, a "· Thinking" suffix when extended thinking is on, and a chevron.
- Menu: one row per model with name, optional badge ("New", "Beta") and a one-line description.
- Selected indicator: a check on the current model.
- Locked rows: muted name and an "Upgrade" tag (or a lock icon when there is no upgrade path).
- Optional footer: an extended-thinking switch with a short explanation.

## Behavior
- The menu opens above the trigger by default, because composers sit at the bottom of the screen.
- Choosing a model closes the menu and returns focus to the trigger; toggling thinking keeps it open.
- Locked models stay visible and can't be selected. Choosing one closes the menu and starts the upgrade flow instead, so the row is an upgrade path, not a dead end.
- The choice persists for the conversation (and ideally as the user's default). A model change mid-conversation applies to the next message, not to past ones.
- Clicking outside, pressing Escape or tabbing away closes the menu.

## Content guidelines
- Describe what a model is for, not its parameters: "Quick answers for everyday tasks", not "8B params, 128k context".
- Keep names short and stable; put version numbers in the description or badge, not the trigger.
- Order models from fastest to most capable, so the list reads as a scale.
- Use badges sparingly — one "New" at a time.

## Accessibility
- The trigger is a real button with \`aria-haspopup="listbox"\` and \`aria-expanded\`.
- The list uses \`role="listbox"\` with \`role="option"\` rows, \`aria-selected\` on the current model and \`aria-disabled\` on locked ones; focus stays on the list and \`aria-activedescendant\` tracks the highlighted row.
- Arrow keys move, Home/End jump, Enter or Space selects, Escape closes and returns focus to the trigger.
- The thinking control is a \`role="switch"\` with a visible label.

## Related patterns
- Prompt Bar embeds a minimal model dropdown; use this pattern when models need descriptions, plan gating or a thinking switch.
- Cost Estimate shows what the chosen model will cost before running — pair them when models are priced differently.
- Rate Limit is what users hit when they stay on an expensive model; the picker is where they can step down.
`;
