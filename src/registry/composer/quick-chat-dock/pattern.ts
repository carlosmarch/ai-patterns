export const pattern = `# Quick Chat Dock

## Summary
A near-invisible handle pinned to the bottom edge of a workspace that wakes into a small action dock on hover. Its main action summons a floating prompt bar for a quick question without leaving the current screen; a second action opens the full agent panel. AI stays one gesture away while taking almost no space.

## When to use
- Canvas-heavy or content-dense apps (editors, boards, dashboards) where a permanent composer or sidebar would steal room, but users still want to ask the assistant something mid-task.
- Products that offer both a lightweight "ask once" flow and a full, persistent agent conversation.

## When not to use
- Chat-first products where the composer is the primary surface — use a docked Prompt Bar instead.
- Touch-first layouts with no hover: the collapsed handle is too subtle to discover. Show the expanded dock permanently or use a floating action button.
- When the bottom edge is already busy (toolbars, status bars, timelines) — the hot zone will fight with them.

## Anatomy
- Collapsed handle: a small, low-contrast pill centered on the bottom edge.
- Hot zone: an invisible strip around the handle, larger than the handle, that wakes the dock.
- Expanded dock: two icon buttons — Quick chat (primary) and Open agent.
- Tooltips: label plus keyboard shortcut for each action.
- Floating prompt bar: single-line input, "continue in agent panel" button, send button.

## Behavior
- Hovering the hot zone morphs the handle into the dock with a quick spring; leaving it collapses the dock after a short grace delay (~150–200ms) so grazing the edge doesn't flicker.
- Hovering or focusing a dock button shows its tooltip with the shortcut.
- Quick chat replaces the dock with the floating prompt bar and focuses its input. Enter sends; Escape or a click outside closes it and discards the draft.
- Open agent opens the full agent panel. From the prompt bar, the panel button carries the current draft into the agent so nothing typed is lost.
- Global shortcuts (e.g. ⇧Enter for quick chat, ⇧A for the agent) work from anywhere except while typing in an editable field.
- After sending, the bar closes and the answer appears where it belongs (inline, a toast, or the agent panel) — the bar itself is not a conversation.

## Content guidelines
- Placeholder invites both search and questions in a few words: "Search or ask anything…".
- Tooltip labels are short verbs or nouns ("Quick chat", "Open agent"); shortcuts are shown as keycaps, not prose.

## Accessibility
- The collapsed handle is a real, focusable button; focusing it expands the dock and moves focus to the first action, so keyboard users never depend on hover.
- The dock is a \`toolbar\`; icon buttons have \`aria-label\`s and expose shortcuts via \`aria-keyshortcuts\`.
- Opening the prompt bar moves focus to its input; closing it should return focus sensibly (to the page, not a removed element).
- Tooltips also appear on focus, not only hover.
- Respect \`prefers-reduced-motion\`: crossfade instead of morphing and sliding.

## Related patterns
- **Prompt Bar** — Use it instead on chat-first surfaces where the composer is the main thing on the page.
- **Command Palette** — Use it instead when the input is a keyboard-first launcher for search and commands rather than a docked chat.
- **Selection Actions** — Use it instead when the toolbar should be anchored to selected content rather than the screen edge.
`;
