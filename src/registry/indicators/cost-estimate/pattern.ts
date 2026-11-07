export const pattern = `# Cost Estimate

## Summary
A card next to the run action that shows what a task will cost before it starts — a figure or range in the product's unit, a rough duration, and a meter of how much of the user's balance it will use. It warns when a run would leave little behind and swaps the action for a top-up when the balance can't cover it.

## When to use
- Usage-priced actions whose cost varies with the input: long documents, batch jobs, video or image generation, agent runs.
- Expensive or slow tasks where an unexpected charge would break trust.
- Settings that change cost (depth, model, length), so users can see the trade-off as they adjust.

## When not to use
- Cheap, everyday actions (a chat reply). Showing a price on every message makes people anxious about using the product.
- Flat-rate plans with no per-action cost. Use Rate Limit when the constraint is a usage cap, not a price.
- When you can't estimate with reasonable accuracy. A wrong estimate is worse than none — show a range or explain what drives cost instead.

## Anatomy
- Estimate: "≈ 26 credits", or a range ("26–33 credits") when cost depends on what the run finds, plus an optional duration.
- Action: the run button, or a "Get more credits" button when the balance is short.
- Balance meter: the remaining balance with the run's share highlighted at the end of it.
- Status line: credits left after the run, a warning when that is low, or how many more credits are needed.
- Optional breakdown: "How is this estimated?" revealing the line items and a note on how billing works.

## Behavior
- The estimate updates live as the user changes inputs; numbers and the meter animate to their new values.
- Warning (amber) when the run would leave less than a set share of the balance; blocked (red) when the upper estimate exceeds the balance, which disables Run or replaces it with a top-up.
- With a range, use the upper bound for warnings, so a run is never started that might be cut off.
- Charge what the run actually uses, and show the final cost afterwards next to the estimate.

## Content guidelines
- Use the product's own unit (credits, tokens, minutes), not money, unless people pay per action in money.
- Round to whole units and prefix single figures with "≈".
- Say what happens at the edges plainly: "Needs 14 more credits than you have", "Leaves you with 8 credits".
- Keep the breakdown to two or three lines in the user's terms ("12 pages × 2 credits"), not internal token counts.

## Accessibility
- The meter is \`role="meter"\` with a text value ("33 of 120 credits").
- The status line is \`aria-live="polite"\`, so changes are announced as inputs change, and the Run button is described by it.
- Warning and blocked states use an icon and text as well as colour.
- Animations are skipped when the user prefers reduced motion.

## Related patterns
- Rate Limit is for caps on usage over time; this pattern prices a single action before it runs.
- Model Picker often drives the cost; show the estimate near it when models are priced differently.
- Human-in-the-Loop and Tool Approval are the confirmation step for risky actions; for expensive ones, the estimate is the confirmation.
`;
