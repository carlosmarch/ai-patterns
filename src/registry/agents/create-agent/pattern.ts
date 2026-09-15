export const pattern = `# Create Agent

## Summary
A 2-step wizard card for creating a named, icon-identified agent and selecting which external event sources activate it. Step 1 captures identity (name and icon); Step 2 captures trigger sources. On completion it emits a typed payload that maps directly onto the Agent Triggers panel.

## When to use
- First-time agent creation where no agent exists yet.
- Onboarding flows that walk users through setting up their first automation.
- An agent catalog screen with an "Add agent" entry point that opens an inline or sheet-level wizard.

## When not to use
- Editing an existing agent's trigger sources — use the Agent Triggers pattern directly, which has per-trigger toggles and a "Finish setup" inline action.
- When only one trigger source is possible. Presenting a multi-select of one option adds unnecessary friction; skip to a single confirmation step instead.
- When agent creation is complex enough to require a full-page form (multiple steps beyond identity and triggers, required integrations, permissions review, etc.).

## Anatomy
1. **Header preview row** — always visible across both steps. Shows the currently selected icon in a rounded avatar, the live agent name (or "New agent" placeholder), and two step-progress dots.
2. **Step 1 — Identity** — a title/subtitle label pair, a text input for the agent name, a row of five icon-picker buttons (Bot, Sparkles, Zap, Brain, Rocket), and a full-width "Choose triggers →" CTA.
3. **Step 2 — Triggers** — a title/subtitle label pair, a \`<ul>\` of trigger source cards (each with a bordered icon square, a label and description, and a trailing checkmark circle), and a two-button footer with "Back" (outline) and "Create agent" (filled).

## Behavior
- The header preview row updates in real time: the name reflects every keystroke; the icon swaps immediately on selection. This gives users continuous feedback on how the finished agent will appear elsewhere in the product.
- Icon selection is immediate with no confirm step — clicking a picker button applies it at once.
- Trigger source cards are multi-select toggle buttons. The user may select zero, one, or all sources; there is no minimum enforcement in the component (enforce constraints in the consuming view if needed).
- Navigating from Step 1 to Step 2 slides content in from the right; navigating back slides from the left. AnimatePresence with \`mode="wait"\` ensures the outgoing step fully exits before the incoming step enters.
- "Create agent" is the terminal action. It fires \`onCreateAgent\` with a payload of \`{ name, iconId, triggerSources }\` and hands control entirely to the parent. The component itself has no post-creation state.
- The "Back" button does not reset Step 1 state — name and icon choices are preserved across forward/back navigation.

## Content guidelines
- Agent names should be short proper nouns or noun phrases that describe the agent's role, not its mechanism: "Pattern Bot", "Deploy Guard", "Design Review" — not "github-trigger-agent-v2".
- The placeholder text "e.g. Pattern Bot" demonstrates the expected format; replace it with a placeholder appropriate to the product domain.
- Trigger source labels name the platform (GitHub, Slack, Figma). Descriptions name the event type that fires the agent, not the agent's response: "Issues, pull requests, and labels" not "Monitors your repo and responds to issues".
- The "Create agent" button label should always say exactly that — avoid "Save", "Done", or "Finish", which imply the agent already exists.

## Accessibility
- The name input has a visible \`<p>\` label ("Name your agent") immediately above it and an \`aria-label\` attribute for programmatic association.
- Each icon-picker button has an \`aria-label\` naming the icon (e.g. "Sparkles") and \`aria-pressed\` reflecting selection state.
- Each trigger source card is a \`<button>\` with \`aria-pressed\` reflecting whether it is selected.
- The step-progress dots in the header are \`aria-hidden\` — they are a decorative visual indicator, not a navigation control.
- Step transitions use motion that respects \`prefers-reduced-motion\` via Motion's default behavior; the \`duration: 0.15\` transitions are brief enough that they cause minimal disruption even without the media-query guard.

## Related patterns
- **Agent Triggers** — the panel displayed after a successful \`onCreateAgent\` callback. The payload from Create Agent maps directly to Agent Triggers' \`title\`, \`agent\`, and \`triggers\` props.
- **Setup Checklist** — use for multi-step onboarding of a whole product or feature area when several independent tasks must be completed, not a single wizard with two sequential screens.
- **Invite Members** — shares the "create something new" modal shape: header preview, multi-step form, terminal action. Reference for visual consistency when both patterns appear in the same product.
`;
