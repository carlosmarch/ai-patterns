export const pattern = `# Publish Gate

## Summary
The step between "the agent built it" and "it's live". Before an app, site or change made by an agent is published or merged, automated rules and an agent review run against it. A failed check says what is wrong and where, and can be handed back to the agent to fix. Publish stays locked until every check passes, and going live is always the person's explicit action — never the agent's.

## When to use
- Agents produce something that leaves the workspace — a deployed app, a public page, a merged pull request — and the person may not have read every line.
- Mistakes are costly once live: leaked keys, pages without sign-in, data exposed to the wrong people.
- The checks can be stated and run automatically (secret scanning, auth coverage, dependency audits, required CI) and an agent can fix most failures.

## When not to use
- Nothing leaves the workspace. A preview or a draft doesn't need a gate; use **Diff Summary Card** to review changes instead.
- Every individual action the agent takes is risky. Gate those one by one with **Tool Approval**; a release gate at the end comes too late.
- The checks can't be fixed by the agent or explained to the person (opaque scores, "risk: 72"). A gate people can't act on teaches them to override it.
- As the only review. Passing checks means "no known problems", not "correct" — say so, and keep human review where it matters.

## Anatomy
- Target: where it will go live, in full ("pricing-calculator.acme.app", "main"), and who will be able to open it.
- Status line: what the gate is doing and what it means — "Running checks · 2 of 4 passed", "1 check failed · nothing has been published".
- Check list: one row per check, with its status, its name in plain words, and where it comes from (Rule for deterministic checks, Agent review for model review).
- Failure detail: under a failed check, one sentence on what is wrong and where, and an "Ask agent to fix" action.
- Publish: the primary button, disabled until every check passes, with a note on why it's locked.
- Admin override (optional): "Publish anyway (admin)", only for people allowed to, and logged.
- Live state: "Live at …" once published, with the sharing scope.

## Behavior
- Checks start when the person chooses to publish and run in a fixed order; each row moves from waiting to running to passed or failed.
- A failed check never blocks silently: it explains itself and offers the fix. Asking the agent to fix it hands over the check and its detail; the row shows that the agent is working.
- After a fix, all checks run again from the top — a fix can break something else.
- Publish unlocks only when every check passes, and nothing is published until the person clicks it. Passing checks never publish on their own.
- An admin override publishes despite failures, records who did it and why, and leaves the failures visible on the live app's record.
- Gate merges the same way: "merge when ready" waits on required checks and stays armed while they are pending.

## Content guidelines
- Name checks as the property that should hold: "No secrets in app files", "Every page requires sign-in" — so a pass reads as a fact.
- Failure details give the thing and the place: "An API key is written in config.ts, line 4", plus the consequence in a few words.
- Say plainly that nothing is live yet while the gate is blocked. People should never wonder whether a failed publish half-happened.
- Use "Publish" for the person's action and "Live" for the result; keep "Deploy", "Ship" and "Release" out of the same flow.

## Accessibility
- The status line is a \`role="status"\` region, so check progress and the final outcome are announced.
- Each row's status is given in text ("Passed:", "Failed:", "Being fixed:"), not only by icon or colour.
- The fix button's accessible name includes the check it fixes. The disabled Publish button has a visible reason next to it.
- Failure details expand with a short height animation that becomes a fade under \`prefers-reduced-motion\`; spinners stop.

## Related patterns
- **Tool Approval** — Use it instead to gate a single risky action while the agent is working, before anything is built.
- **Diff Summary Card** — Use it as well so the person can see what changed before choosing to publish.
- **Agent Run Card** — Use it to report the run that produced the build; the gate takes over when it's time to go live.
- **Checkpoint Restore** — Use it as well to get back to a good state when the agent's fix makes things worse.
`;
