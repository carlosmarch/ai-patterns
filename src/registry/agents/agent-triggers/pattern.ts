export const pattern = `# Agent Triggers

## Summary
A configuration panel listing the external events that cause an agent to run automatically, each with an on/off toggle and an optional "Finish setup" prompt for incomplete integrations. A "Run agent" button lets the user fire the agent on demand outside of any trigger, and a footer row provides one-click entry points for adding new trigger sources.

## When to use
- In an agent or automation settings panel where users define when a workflow should start.
- When an agent can be connected to multiple external sources (GitHub, Slack, Figma, etc.) and users need to pick which ones activate it.
- Alongside an agent canvas or workflow builder, as the entry-point node configuration.

## When not to use
- For simple scheduled or time-based recurrence — use a cron or schedule picker instead; event-based and time-based triggers have different mental models and should not share this component.
- When there is only ever one possible trigger — a list of one is not a list; use a single connection widget or toggle.
- As a general settings list. This component is about activation conditions, not preferences.

## Anatomy
- Header: a title ("Triggers") and a subtitle ("When should this agent run?") scoped to the agent being configured.
- Run agent button: an outlined play button in the header that fires the agent manually, independent of any trigger. It enters a transient "Running…" state while the agent executes.
- Trigger list: one row per trigger, each containing an icon that identifies the source, an event name in medium weight followed by a muted location context ("in Slack", "in dm-cmarch/ai-patterns"), and a toggle on the trailing edge.
- Finish setup label: a small underlined text link that appears before the toggle when a trigger has been added but not yet fully configured. Enables the trigger rather than completing setup inline — that flow belongs in a dedicated integration modal.
- Add trigger footer: a "＋ Add trigger" text button plus icon shortcuts for common source platforms (GitHub, Slack, Figma). Both lead to the same source-picker; the icons are just accelerators for recognized integrations.

## Behavior
- Toggling a trigger on/off is immediate and optimistic — the UI updates before the server round-trip. If the save fails, revert and surface an error.
- "Finish setup" shows only when \`needsSetup\` is true and the trigger is currently off. Once the user enables the trigger (completing setup), the label disappears.
- Run agent is a one-shot control: clicking it disables the button and swaps its label to "Running…" until the run resolves, then restores the idle state. It does not reflect ongoing trigger-based runs.
- The trigger list is non-reorderable — triggers fire in parallel on any matching event, so order has no semantic meaning.
- Adding a new trigger appends it to the list in a needs-setup state with the toggle off; the "Finish setup" label appears immediately.

## Content guidelines
- Event names are short noun phrases or gerunds that describe the inbound event, not the agent's response to it: "Issue labeled pattern-request", "Frame marked ready for dev". Start with the noun (Issue, Frame, Message) so items scan consistently when the list grows.
- The context string names the specific location in sentence-case with no trailing period: "in dm-cmarch/ai-patterns", "in any Figma file".
- Platform icons should match the brand icon for the integration, not a generic glyph. When a brand icon isn't available, use a domain-appropriate generic (a hashtag for channels, an @ for mention events).

## Accessibility
- The toggle must be a \`<button role="switch" aria-checked={enabled}>\` — not a styled \`<div>\` — so screen readers announce the state change.
- Each toggle must have an accessible label. Since the label is provided by the adjacent row text, use \`aria-labelledby\` pointing to the event name element, or wrap the row in a \`<label>\`.
- "Finish setup" must be keyboard reachable and announce where it leads: \`aria-label="Finish setup for Frame marked ready for dev"\`.
- The quick-add platform icons in the footer are icon-only buttons; each must carry an \`aria-label\` naming the platform ("Add GitHub trigger").

## Related patterns
- Flowchart: the canvas-level counterpart — Agent Triggers configures the entry-point event, while the Flowchart node describes what conditions gate the work that follows.
- Tool Approval: also governs what an agent is allowed to do, but at the per-call level rather than the activation level.
- Setup Checklist: shares the "incomplete step" affordance (the Finish setup label) — use Setup Checklist when onboarding a whole agent for the first time; use Agent Triggers when managing an already-running agent's event sources.
`;
