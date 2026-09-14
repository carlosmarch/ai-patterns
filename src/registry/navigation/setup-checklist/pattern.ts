export const pattern = `# Setup Checklist

## Summary
A compact onboarding card that surfaces a short list of setup steps, tracks progress with a circular arc indicator, and lets users work through each step sequentially or in any order. Completed steps collapse into struck-through, muted rows while remaining steps stay actionable.

## When to use
- First-run onboarding for AI agents, desktop apps, or workspaces (e.g., "Set up Computer", "Connect your tools").
- Post-signup activation flows where completing each step unlocks value (connected integrations, notifications, first task).
- Re-surfacing incomplete setup inside a dashboard or sidebar when the user still has steps pending.

## When not to use
- Long multi-step wizards (more than ~5 steps) — use a dedicated onboarding screen with a stepper instead.
- Flows where steps must be completed in strict sequence and blocking is required — the checklist pattern implies optional ordering.
- Critical setup that must gate the core experience — surface a blocking modal instead.

## Anatomy
- **Header bar**: title (product or object being set up) on the left; step counter (e.g., "1 / 3") and circular arc progress indicator on the right.
- **Step list**: a card containing one row per step, separated by hairline dividers.
- **Step row**: status icon + label + optional app-icon cluster + chevron (pending only).
- **Status icon — pending**: dashed-stroke circle (conveys "not yet started" without implying failure).
- **Status icon — done**: filled muted circle with a checkmark; label gains line-through decoration.
- **App icons**: small colored squares shown for steps tied to integrations; hidden once the step is done.
- **Chevron**: right-pointing arrow on actionable rows; removed once done.

## Behavior
- Clicking a pending row triggers that step's action (e.g., opens an OAuth sheet or a settings panel) and, on success, marks it done.
- Marking a step done animates its status icon (spring scale-in) and immediately updates the circular arc.
- The arc animates to the new progress value with a short ease-out tween each time a step is completed.
- All steps done: show a completion affordance (e.g., confetti, success state, or a "Replay" button in demos).
- Steps may be completed in any order unless the product constrains it; the component does not enforce ordering.

## Content guidelines
- Title: short verb phrase naming the object being configured — "Set up Computer", "Connect your workspace". Not "Onboarding".
- Step labels: imperative sentence fragments starting with a verb — "Connect your apps", "Turn on notifications". Max ~35 characters so they fit on one line.
- App icons: max 3–4; beyond that they become unreadable. Use brand colors for recognition.

## Accessibility
- The progress arc is decorative (\`aria-hidden\`); the counter text ("1/3") is the accessible progress signal.
- Each step row must be a real \`<button>\` element; disabled when done so it is skipped by keyboard navigation.
- Status icons carry \`aria-label\` ("Completed" / "Pending") for screen reader users.
- The step list should be wrapped in an \`aria-live\` region so screen readers announce completion events.

## Related patterns
- Analysis List — sequential item resolution during an AI analysis run, not user-driven.
- Tool Approval — one-at-a-time permission prompts, not a persistent checklist.
`;
