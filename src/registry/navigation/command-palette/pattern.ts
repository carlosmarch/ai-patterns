export const pattern = `# Command Palette

## Summary
A search-first overlay for jumping to or launching something — a session, a document, a command — without leaving the keyboard. A single input filters a short list of quick actions and recent items; arrow keys move the highlight, Enter commits it.

## When to use
- Switching between many similar items (sessions, chats, files, projects) faster than a sidebar or list view allows.
- Surfacing a small set of global actions ("New session", "New chat") alongside recent history in one place.
- Any surface that already has a keyboard-shortcut culture (⌘K launchers, IDE-style command bars).

## When not to use
- A handful of items (fewer than ~6) that fit comfortably in a visible list or dropdown — the overlay adds a step for no benefit.
- Destructive or multi-step actions (delete, bulk export). The palette commits on a single Enter; anything needing confirmation belongs in its own flow.
- As the only way to reach a primary action. Always keep a visible trigger (button, menu item) alongside the keyboard shortcut — the shortcut is an accelerator, not the sole path.

## Anatomy
- Backdrop (dims and blurs the page behind the palette, closes on click).
- Search input with a leading search icon and a close (×) button.
- Scrollable result list, grouped into labeled sections (e.g. "Quick actions", "Recent").
- Each row: optional leading icon, label (truncates), optional trailing meta text (timestamp, source).
- Footer hint bar: keyboard legend for select / open / close.

## Behavior
- Opens via an explicit trigger (button) and/or a global shortcut (⌘K / Ctrl+K); the trigger must remain visible even where the shortcut exists.
- The search input autofocuses the moment the palette opens.
- With an empty query, show the full grouped list (quick actions first, then recent items) — don't force typing before anything is visible.
- Typing filters items by label across all groups in place; groups with no matches collapse out entirely rather than showing an empty header.
- Arrow Up/Down move the highlighted row, clamped at the first/last item (no wraparound) so repeated key-holds don't overshoot silently.
- Hovering a row also updates the highlight, kept in sync with keyboard navigation.
- Enter commits the highlighted row; clicking a row commits it directly.
- Escape, a backdrop click, or the × button close the palette without committing.
- Closing resets the query and highlight so the next open starts fresh.
- The highlighted row auto-scrolls into view as it changes, so keyboard navigation never drifts off-screen in a long list.

## Content guidelines
- Row labels are the item's real name (a session title, a file name) — never a truncated ID or slug.
- Meta text is short and secondary: a relative timestamp ("Just now", "Last hour") or a compact source tag ("PR #52"). Never wrap it.
- Group labels are short nouns ("Quick actions", "Recent") — not instructions.
- The empty-results message is a plain statement ("No matches"), not a call to action.

## Accessibility
- Root overlay uses \`role="dialog"\` with \`aria-modal="true"\` and a descriptive \`aria-label\`.
- The input uses \`role="combobox"\` with \`aria-expanded\` and \`aria-controls\` pointing at the result list, plus \`aria-activedescendant\` tracking the highlighted row's id.
- The result list uses \`role="listbox"\`; each row is \`role="option"\` with \`aria-selected\` reflecting the current highlight.
- All interaction must work from the keyboard alone: focus starts in the input, arrow keys and Enter never require a pointer.
- Respect \`prefers-reduced-motion\` by skipping the backdrop fade and panel scale/slide.

## Related patterns
- None. This is a standalone navigation/launcher pattern, not part of an agent-status sequence.
`;
