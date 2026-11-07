export const pattern = `# Memory Panel

## Summary
A settings panel listing what the assistant remembers about the user, where each memory can be edited or forgotten, with a master switch for memory and a "Forget all". A matching one-line notice in the chat tells the user when something new is saved. Together they make personalisation visible and reversible.

## When to use
- Assistants that save facts about the user across conversations (role, preferences, projects) and use them in later answers.
- Products where personalisation could surprise people — they should be able to see why an answer assumed something.
- Anywhere data-protection rules give users the right to see and delete what is stored about them.

## When not to use
- Context that only lives within one conversation — that is the chat history, not memory.
- Organisation-level knowledge (docs, connectors). Use Connector Panel for sources the AI can read.
- As the only control. Pair it with a temporary-chat option (Incognito Toggle) so people can avoid saving in the first place.

## Anatomy
- Header: title, a one-line explanation that changes when memory is off, and a master switch.
- Memory rows: the memory in plain language, an optional source line ("From a chat on 12 Oct"), and edit and forget actions.
- Inline editor: a textarea replacing the row, with Save and Cancel.
- Empty state: what memory is for and how to add one.
- Footer: a count, an Undo affordance after a deletion, and a two-step "Forget all".
- Memory-updated notice: a pill in the chat ("Memory updated · …") with a Manage link to the panel.

## Behavior
- Forgetting a memory removes it at once and shows Undo for a few seconds; the deletion is committed when that window passes. Forgetting another memory commits the previous one first.
- "Forget all" asks for a second click and resets if focus leaves the button.
- Turning memory off keeps saved memories but stops saving and using them; the list dims and the header explains this. Turning it back on restores them.
- Editing saves on Enter or Save, cancels on Escape; an empty edit is discarded.
- The notice appears in the conversation at the moment a memory is saved, never silently.

## Content guidelines
- Write memories as short, third-person facts: "Prefers concise answers", not "The user has mentioned that they would like…".
- Say where each memory came from, so users can tell inferred facts from ones they asked for.
- Use "Forget" rather than "Delete" — it describes the effect on the assistant.

## Accessibility
- The master switch is a \`role="switch"\` with an accessible name.
- Edit and forget buttons name the memory they act on; they stay visible on touch and on keyboard focus, and only hide on hover-capable screens.
- Undo and the memory-updated notice are \`role="status"\` so screen readers announce them.
- The inline editor takes focus when opened; Escape cancels without saving.

## Related patterns
- Incognito Toggle is the up-front control: it stops memories being saved for one chat, where this panel manages them afterwards.
- Connector Panel governs which external sources the AI can read; this panel governs what it has learned about the user.
- Tool Approval asks before an action runs; memory saves are low-risk enough to happen inline, then be reversed here.
`;
