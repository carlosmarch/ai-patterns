export const pattern = `# Checkpoint Restore

## Summary
An automatic checkpoint before every message to an agent that edits things — code, a project, a document — with a Restore action on each one. Restoring asks what to roll back (the files, the conversation, or both), says exactly which files and messages that touches and what it can't undo, and then leaves a "Restored to checkpoint" marker with Redo, so going back is never a one-way trip.

## When to use
- An agent changes files or project state over many turns, and a turn can go wrong in a way that's tedious to undo by asking.
- People experiment — "try it green", "now try a sidebar" — and want to get back to the last good state in one step.
- Undo history in the editor doesn't cover what the agent did, or the agent touched many files at once.

## When not to use
- The agent doesn't change anything outside the chat. Editing a message and regenerating (branches) is enough.
- Changes are already reviewed and applied one by one (accept / reject per diff). Restore adds a second, competing undo.
- As a replacement for version control. Checkpoints are local to a session; say so, and keep commits as the durable history.
- When most of a turn's effects can't be reverted (sent emails, payments, migrations). A restore that undoes only part of the work misleads more than it helps — gate those actions before they run instead.

## Anatomy
- Checkpoint line: a quiet divider before each user message, with a number and time. Its Restore action appears on hover and keyboard focus.
- Restore confirmation: inline under the line, not a modal. A title ("Restore to before this message?"), three choices — Code and conversation, Code only, Conversation only — each with a one-line hint.
- Impact summary: the counts that change ("Reverts 3 files and removes 4 messages"), the file list with how each is affected, and a plain note on what isn't covered.
- Restored marker: a dashed row where the undone turns were, with the counts and a Redo button.
- Reverted files: in Code only mode, the later turns stay visible with their file chips struck through and marked "Reverted".

## Behavior
- A checkpoint is taken automatically before each message runs — never ask people to remember to save one.
- Restore defaults to code and conversation, the common "start again from here" case. The summary updates as the choice changes.
- After a conversation restore, the rewound prompt goes back into the composer so it can be edited and resent.
- One restore at a time: other Restore actions are disabled while a restore is in effect, until the user redoes it or sends a new message (which discards the undone turns for good).
- Redo puts back exactly what the last restore removed — files and messages.
- Say what isn't tracked, every time: commands run in a terminal, database writes, files changed outside the agent. Don't bury it in docs.

## Content guidelines
- Use "Restore" for the action and "Restored to checkpoint" for the result. Avoid "Revert", "Rollback" and "Undo" for the same thing in one product.
- Counts beat adjectives: "Reverts 3 files", not "Reverts your recent changes".
- Name files by path, in monospace, so people can check them against their editor.
- The untracked note is one short sentence of fact: "Terminal commands and database changes aren't undone."

## Accessibility
- Each Restore button is visible on keyboard focus, not only on hover, and its accessible name includes the message it restores to.
- The confirmation is a labelled group with a native radio fieldset; focus moves to the first choice when it opens, and Escape cancels back to the Restore button.
- After restoring, focus moves to the restored marker, which is a \`role="status"\` region so the outcome is announced.
- File-change icons carry text equivalents ("will be deleted", "edits undone"); struck-through chips also say "Reverted" in text.
- Under \`prefers-reduced-motion\`, the confirmation fades instead of expanding.

## Related patterns
- **Conversation Branches** — Use it instead when only the reply should change, not files.
- **Diff Summary Card** — Use it as well to show what a turn changed before deciding to restore.
- **Plan Review** — Use it before the run, so fewer turns need restoring afterwards.
- **Tool Approval** — Use it instead for actions a checkpoint can't undo, so they're gated before they run.
`;
