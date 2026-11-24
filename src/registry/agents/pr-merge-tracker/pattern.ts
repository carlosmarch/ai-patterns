export const pattern = `# PR Merge Tracker

## Summary
After an agent opens a pull request, it keeps tracking it until it lands. A card in the conversation shows the PR, its required checks and reviews ticking over as they resolve, and one line on what the agent is doing right now. When a check fails, the agent reads the log and pushes a fix; when everything is green it merges — unless the person has turned "Merge when ready" off or stopped tracking. It replaces "go check CI and ping me" with a visible, interruptible commitment.

## When to use
- When an agent has opened a PR (adding an entry to \`src/registry/index.ts\`, a scout report from \`npm run scout\`) and the remaining work is waiting: CI, a preview build, a review.
- When the agent can respond to what happens on the PR on its own — fix a failing lint, answer a review comment, rebase — without the person relaying it.
- When the person may want the PR merged hands-off, but still needs to see what will be merged and stop it.

## When not to use
- When the agent can't act on PR events — a tracker that only mirrors the checks is just the PR page; link to it instead.
- For a single gate before going live with no code-review loop — use **Publish Gate**.
- For several long-running jobs at once — use **Background Tasks Drawer**, and open a tracker from there.
- When repository rules forbid automated merges: keep the tracker, but drop the auto-merge switch and end at "ready to merge".

## Anatomy
- **PR header**: a pull-request icon, the number and title, the head → base branches in mono, and a status pill ("Tracking", "Not tracking", "Merged").
- **Requirements list**: every required check and review in the order the PR page lists them ("npm run lint", "npm run build", "Workers Builds: ai-patterns", "1 approving review"), each with a pending, running, passed or failed icon.
- **Failure detail**: under a failed requirement, one sentence on what broke and where.
- **Status line**: a summary ("3 of 4 passed · merges when ready") and, beneath it, what the agent is doing ("Pushed 1 commit · checks restarted").
- **Footer**: a "Merge when ready" switch, a Merge button when it's off and everything has passed, and "Stop tracking".

## Behavior
- The card appears as soon as the PR is opened and stays in the transcript, always showing the PR's latest state.
- Requirements update live; an icon swap is the only motion, so a page of trackers stays calm.
- On a failure the detail line expands under the check, the status line says the agent is fixing it, then reports the pushed commit; the check goes back to running.
- With "Merge when ready" on, the agent merges the moment the last requirement passes and the header turns to "Merged". With it off, it stops at "ready to merge" and shows a Merge button; nothing merges without that click.
- Auto-merge stays on while checks are pending or re-running — a new push doesn't silently turn it off.
- "Stop tracking" ends all agent activity on the PR: no more pushes, comments or merges. The requirements dim and "Track again" picks up where it left off.
- After merging, the footer goes away and the status line says where the work landed ("PR Merge Tracker is in the catalogue").

## Content guidelines
- Name checks exactly as the PR page does, so the person can match them up; name reviews by what's required ("1 approving review"), not by reviewer.
- Write failure details as cause and place: "'Check' is defined but never used in demo.tsx", not "Lint error".
- Keep the activity line in the past or present tense of real actions ("Pushed 1 commit", "Waiting for the PR preview build"), never vague progress ("Working on it…").
- Say "Merge when ready" and "Stop tracking" literally; the person should know exactly what each one stops.

## Accessibility
- The card is a labelled \`section\` ("Tracking pull request #267"); requirements are a labelled list.
- Each requirement's status is in text (visually hidden "Passed", "Failed") as well as its icon, which is \`aria-hidden\`.
- The status line is a polite live region, so failures, pushes and the merge are announced.
- "Merge when ready" is a \`switch\` with \`aria-checked\`, labelled by its visible text; it's disabled once tracking stops or the merge has started.
- Spinners stop under \`prefers-reduced-motion\`; status changes are still conveyed in text.

## Related patterns
- **Publish Gate** — Use it when the agent's work goes live directly, with checks but no PR.
- **Agent Run Card** — Use it for the run that produced the PR.
- **Background Tasks Drawer** — Use it to list several tracked PRs at once.
- **Diff Summary Card** — Use it to show what the PR changes before it merges.
- **Scheduled Task** — Use it when the follow-up is time-based rather than driven by PR events.
`;
