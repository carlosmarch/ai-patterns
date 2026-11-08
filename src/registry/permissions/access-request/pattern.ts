export const pattern = `# Access Request

## Summary
A prompt the agent raises when it needs more access than it has — a wider network, a new credential, a broader folder, a shared resource — and only a person can grant it. The product, not the agent, renders what would change: the target and who owns it, each setting as before → after, and who else the change reaches. The agent's justification sits beside it, clearly attributed, so the person can weigh the reason against the facts. Approve and Deny are the only ways out, and the answer collapses to a one-line record.

## When to use
- An agent hits a boundary set by its environment or sandbox (blocked host, missing secret, read-only path) and the task can't continue without changing that boundary.
- The change outlives the current action — it's saved on an environment, a workspace or a team setting — so it needs a deliberate grant, not a per-call yes.
- The change can reach other people or sessions, and the person approving needs to see that before saying yes.

## When not to use
- Approving one tool call with no lasting effect. Use Tool Approval; it's lighter and offers allow-once.
- Choosing between several ways forward ("allow these three hosts, or everything?"). Ask that first with a Human in the Loop question, then raise one request for the option chosen.
- Granting access the person doesn't control (an admin-owned policy). Say who can grant it and how to ask them, instead of offering an Approve that will fail.
- Collecting the secret itself. Send the person to a secure form; the card never holds a token or password.

## Anatomy
- Header: a lock tile, the request as a question ("Update environment?"), and under it the target's name with an ownership badge (Personal, Team, Organization).
- Reason: the agent's own sentence in a muted block, captioned with the agent's name ("Claude's reason"), so it reads as a quote, not as a system fact.
- Changes: a compact table, one row per setting — label, old value struck through, arrow, new value — so values line up for scanning. A "Widens access" tag marks any row that lets the agent reach more than before.
- Footer: the impact line — who and what the change applies to beyond this moment ("this session and every session that uses this environment") — on the leading side, and the actions on the trailing side: a quiet Deny, then the primary button named for the effect ("Update environment"). On narrow screens the actions can stack full width below the impact line.
- Resolved state: a single row — "Access updated" with the new values, or "Request denied" and that the agent continues without it.

## Behavior
- The changes list and impact line come from the system that will apply the change, computed from the actual diff. The agent supplies only the reason; it can't word the change or soften its scope.
- Nothing changes until Approve. Deny is final for this request, and the agent must carry on without the access and say what remains blocked — it doesn't re-ask in chat or raise the same request again.
- Approving applies the change at once and the agent retries the blocked step; the resolved row records what was granted so it stays visible in the transcript.
- No default focus on Approve: a request that widens access shouldn't be one Enter away.
- Entry is a short rise and fade; the swap to the resolved row is a crossfade. Both drop to instant under reduced motion.

## Content guidelines
- Name the primary button after the effect ("Update environment", "Add credential"), not "OK" or "Allow".
- Values are literal and complete: "Any host", "api.example.com", "12 domains → discarded". Never "more access" or "some settings".
- The reason is one sentence about the task it unblocks ("Let the scout read public docs and changelogs"), not a plea or a claim that it's safe.
- Ask for the narrowest change the task needs; when the agent requests the widest option, the "Widens access" tag and the impact line have to make that plain.

## Accessibility
- The card is an \`alertdialog\` labelled by its title; the changes are a real table with row headers, and both actions are real buttons reachable by keyboard in the order shown.
- Column headers (Setting, Now, After approval) are visually hidden but read out; the strike and arrow are decoration.
- The "Widens access" tag pairs its colour with an icon and text, so it doesn't depend on colour alone.
- The resolved row is a status region, so the outcome is announced when the card collapses.

## Related patterns
- **Tool Approval** — Use it instead for a single call with no lasting change; use this when the grant is saved and outlives the action.
- **Human in the Loop Question** — Use it before this one when the person has to pick how much access to grant.
- **Connector Panel** — Use it as well, so people can review and revoke standing access later.
- **Autonomy Mode Switcher** — Use it beside this; it sets how often the agent asks, not what it can reach.
`;
