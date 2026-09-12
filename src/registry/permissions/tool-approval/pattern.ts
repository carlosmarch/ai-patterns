export const pattern = `# Tool Approval

## Summary
A pending permission prompt shown before an agent executes a tool call it doesn't already have standing approval for: the tool's name, a plain-language summary of what it's about to do, the literal call (command, path, args) it will run, and three ways to respond — deny it, allow it once, or always allow it going forward. Once answered, it collapses into a compact resolved row so the transcript keeps moving.

## When to use
- Before any tool call whose effect is irreversible, external, or otherwise outside the trust the agent already has (running a shell command, calling a paid API, writing outside the project, sending a message on the user's behalf).
- Inline in an agent transcript or chat UI, at the point the call would happen — not as an app-blocking modal, since the user usually wants the surrounding conversation still visible while deciding.

## When not to use
- For actions the user already granted standing permission for — show them running, not asking again. Re-prompting after "always allow" erodes trust in the setting.
- For read-only, side-effect-free calls (e.g. re-reading a file already in context) where the friction outweighs the risk — gate only what actually needs gating.
- As a generic confirm dialog for non-tool actions (e.g. "delete this message?"). Use a plain confirmation pattern instead; this one is specifically a pending tool call with a scope decision attached.

## Anatomy
- Header line: a small inline tool icon, the tool's name, and a one-line plain-language description of the action, all on a single row — kept light since this is a transient prompt, not a card that has to carry visual weight.
- Detail block: the literal call being made (a shell command, a URL, a file path) in monospace, so the user can verify exactly what will run rather than trusting the summary alone.
- Action row: Deny, Always allow (with a scope picker), and Allow — deny nearest the reading start, the two affirmative actions grouped on the trailing side.
- Resolved state: once answered, the whole prompt collapses to the same single-line shape as the header, with a small status icon in place of the action row and the label swapped in for the summary ("Allowed", "Always allowed for this project", "Denied").

## Behavior
- "Always allow" is a split control: clicking the label applies a default scope immediately; the attached chevron opens a short menu of narrower/wider scopes (e.g. "this command", "this project", "always") so precision doesn't cost extra clicks in the common case.
- A decision is terminal for this prompt — there's no separate confirm step after clicking one of the three actions, and none of the actions stay interactive once a decision is recorded.
- Deny doesn't carry a scope; it always applies to just this one call. Permanently blocking a tool belongs in settings, not this prompt.
- The detail block shows the actual call verbatim (real command, real path), never a paraphrase — this is the one place the user gets to verify before it runs.

## Content guidelines
- Tool names are short and literal ("Bash", "Web Search"), not a marketing name for the underlying feature.
- The summary states the action, not the agent's justification for it ("Run a shell command", not "I need to check if the tests pass").
- Scope labels in the always-allow menu name what they cover concretely ("this project", "this command"), never vague terms like "sometimes".

## Accessibility
- The three (or more, with scope options) actions must be real, focusable buttons — a keyboard-only user needs to reach Deny as easily as Allow.
- The always-allow menu follows the standard disclosure pattern: \`aria-haspopup\`/\`aria-expanded\` on the trigger, and closes on Escape or an outside click.
- Don't rely on color alone to distinguish Allow from Deny — the label text already carries the meaning, so keep it even under custom theming.

## Related patterns
- Diff Summary Card is the after-the-fact counterpart — this pattern gates a call before it runs, that one summarizes calls that already ran.
- Prompt Bar's chip-with-chevron dropdown is the same disclosure idiom used here for the scope picker.
`;
