export const pattern = `# Agent Setup Pill

## Summary
A small floating pill that hands setup off to the user's AI coding agent in one click. The label names the outcome ("Onboard your agent to Acme"), a row of agent marks shows which tools it works with, a tooltip says what the click will do, and clicking copies a ready-made setup prompt to the clipboard. A separate round button dismisses it.

## When to use
- Docs sites, dashboards and quickstarts where many users will set the product up through Claude Code, Cursor, Copilot or similar instead of by hand.
- As a lightweight, always-reachable entry point that sits alongside the regular docs — not instead of them.
- When the setup can be described as one self-contained prompt (install, configure, verify).

## When not to use
- Inside a guided onboarding step that needs to wait for a first event — use the Prompt Onboarding card, which shows the prompt and tracks status.
- When the setup needs account-specific secrets the page can't safely put in a prompt on a public page.
- As a general "Ask AI" entry point — this pill only copies a setup prompt; it doesn't open a chat.

## Anatomy
- Pill button: outcome label + a row of 3–5 agent marks.
- Tooltip above the pill: one line describing the action ("Copies a setup prompt for your AI coding tool").
- Copied state: the label swaps to a check and a short instruction; the marks collapse.
- Dismiss button: a separate circular button with an ×, visually detached from the pill so it can't be hit by accident.

## Behavior
- Enters with a short rise-and-fade once the page settles; agent marks stagger in after the label.
- Hover or keyboard focus shows the tooltip; Escape, blur and pointer leave hide it. The tooltip never appears in the copied state.
- On hover, the agent marks fan out slightly as an affordance that the pill is clickable.
- Click copies the prompt. The label rolls to "Prompt copied — paste it into your agent" with a check for ~2s, then returns. The pill resizes smoothly between the two widths.
- If the clipboard API is blocked, still confirm, and make sure the prompt is reachable elsewhere (e.g. a docs page) so the user isn't stuck.
- Dismiss hides the pill with a short exit animation and should persist (per user or per browser) — don't bring it back on the next page view.

## Content guidelines
- Label: outcome-first and product-specific — "Onboard your agent to Acme", "Set up Acme with your agent". Not "Copy prompt".
- Tooltip: one sentence, says exactly what happens — the click copies, it doesn't open anything.
- Prompt: imperative, numbered steps, an explicit definition of done, keep secrets in env vars, and ask the agent to summarize its changes.
- Agent marks: only tools the prompt has actually been tested with; keep the brand marks small and monochrome except where the brand colour is the mark.

## Accessibility
- The pill is a real \`<button>\`; its accessible name is the visible label. The agent marks are \`aria-hidden\` decoration (each still has a \`title\` for sighted pointer users).
- The tooltip uses \`role="tooltip"\` and is linked with \`aria-describedby\` while visible; it opens on focus as well as hover.
- The copied confirmation is announced through an \`aria-live="polite"\` region.
- The dismiss button has \`aria-label="Dismiss"\` and a 40px hit target.
- Respect \`prefers-reduced-motion\`: drop the rise, roll and fan-out; keep plain fades.

## Related patterns
- **Prompt-Driven Onboarding** — Use it instead when there is room for the full card with a prompt preview, snippet fallback and first-event status.
- **Setup Checklist** — Use it as well so a dismissed pill's step can live on as a checklist item.
- **Shiny Button** — Use it instead for a different single call to action, and don't show both on one screen.
`;
