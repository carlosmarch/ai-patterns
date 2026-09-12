export const pattern = `# Tool Approval

## Summary
An inline card that pauses an agent's turn to ask the user to allow or deny a specific tool call before it runs — naming the tool, showing the exact command/arguments, and offering "Always allow" alongside a one-time Allow and a Deny. It's the gate that keeps an agent from taking a consequential action without explicit consent.

## When to use
- Before executing an action with real side effects the user should confirm: running a shell command, sending a message, spending money, deleting or overwriting data.
- Whenever the user (or an admin policy) has configured "ask before X" for a class of tools.
- For actions that are hard or impossible to undo — the higher the stakes, the more this pattern earns its interruption.

## When not to use
- For read-only or low-risk calls (a search, a file read) that don't need gating — prompting for everything trains users to click Allow without reading, which defeats the point.
- After the action already happened. This is a gate, not a log entry — use a trace or a Diff Summary-style pattern to report what already ran.
- As a blanket, unscoped "trust this agent forever" toggle. "Always allow" should scope to this tool (and ideally this session or project), never silently disable approval for everything.

## Anatomy
- Icon: a plain tool glyph normally, a warning glyph when the action is destructive.
- Ask line: "Run \`<toolName>\`?" plus an optional one-line description of what it will do.
- Command/argument preview: the literal command or payload, in a monospace block — never a paraphrase.
- Primary actions: Allow (once), Always allow (scoped to this tool), and Deny.
- Optional reason field: shown when the user picks Deny, so they can tell the agent what to do instead.
- Resolved state: once answered, the card collapses to a compact one-line result (Allowed / Always allowed / Denied) that stays visible as a record.

## Behavior
- Appears inline at the exact point the agent wants to invoke the tool; the agent's turn is blocked until the prompt resolves.
- Allow and Always allow both let this specific call proceed; Always allow additionally suppresses the prompt for future matching calls (same tool, and typically same scope — session or project) and should surface a lightweight indicator when it silently allows a later call.
- Choosing Deny reveals a short optional text field before committing, so the user can redirect the agent instead of just blocking it.
- Escape is treated as Deny — the safer default when a user dismisses the prompt without an explicit choice.
- Once resolved, the card does not disappear; it collapses into a compact resolved-state row so the transcript keeps an accurate record of what was allowed or denied.

## Content guidelines
- Show the real command or arguments verbatim, exactly as they'll execute, so the user can verify what they're approving.
- Keep the ask specific — name the tool and its target ("Run \`delete_file\`?" on \`report.pdf\`), never a generic "Allow this action?".

## Accessibility
- Focus moves to the prompt when it appears, and Allow/Always allow/Deny are all reachable and operable by keyboard.
- Wrap state changes (resolved result) in an \`aria-live="polite"\` region, since the prompt can appear mid-conversation and interrupt reading.
- Don't signal destructive vs. safe with color alone — pair it with an icon and label change.

## Related patterns
- Tool Call Chip shows the in-flight and completed state of a call once it's been approved.
- Diff Summary is the after-the-fact review counterpart for a batch of file edits, once changes have already been made.
`;
