export const pattern = `# Context Chips

## Summary
A row of removable chips above the composer that shows exactly what the model will see with the next message — files, folders, documents from connected apps, web pages. Chips are added from one searchable menu, opened by a + button or by typing @, and each one can be removed in a click. Context the product adds on its own (the open file, the current page) gets its own chip that can be excluded but not deleted, so nothing is attached silently.

## When to use
- The model can draw on several kinds of source (local files, connected apps, the web) and the user should choose which ones a message uses.
- Answers depend heavily on the right material — code, specs, a thread — and guessing wrong is costly.
- The product adds context automatically and people need to see it and turn it off.
- Attachments should persist across follow-up messages until the user removes them.

## When not to use
- The model finds sources on its own well enough — searching the codebase or the web — and asking people to pick adds work for no gain. Offer chips as an override, not a required step.
- Only uploads are involved. Use an attachment tray with upload progress instead.
- Single-source products (one document, one dataset), where the source is implied and a chip would only repeat it.

## Anatomy
- Chip row: above the text input, one chip per source, in the order added. Each chip has a type icon, a truncated label (full path or URL on hover) and a remove button.
- Automatic chip: first in the row, styled as a toggle. Excluded, it turns dashed and struck through but stays in place so it can be brought back.
- Add context button: a + with a label in the composer's toolbar.
- Source menu: a search field, results grouped by kind (Files, Connectors, Web), each row with an icon, label, a second line (path, app and freshness, URL) and a check when attached. A footer hint names the keys.

## Behavior
- The + button and an @ typed at the start of the input or after a space open the same menu; the @ is consumed, not left in the text.
- The menu is multi-select: choosing a row adds or removes it and the menu stays open, so several sources can be picked in one go. Escape or an outside click closes it and returns focus to the input.
- Search filters across label, detail and group as the user types; an empty result says what didn't match.
- Removing a chip is immediate and undoable by adding it again — no confirm. Backspace in an empty input removes the last chip, as in tag inputs.
- Chips persist for follow-up messages in the same conversation until removed. Say so if the product drops them after sending.
- The automatic chip changes when its source changes (switching files updates it) and keeps its excluded state until the user includes it again.
- If a source can't be read (permissions, too large, still indexing), keep the chip and mark it, rather than removing it or failing the send silently.

## Content guidelines
- Labels are the source's own name ("pricing.ts", "#billing-launch"), not a type ("File", "Channel").
- The second line adds the thing people use to tell similar sources apart: a path, the app and when it was edited, a domain.
- Name the automatic chip after the thing, not the mechanism: "Checkout page", not "Current context".
- Hint text in the input teaches the shortcut once: "Ask anything… type @ to add context".

## Accessibility
- The chip row is a labelled list ("Context for this message"); each remove button is named "Remove <label>".
- The automatic chip is a toggle button with \`aria-pressed\` and a description of what it is, not only an eye icon.
- The menu's search field is a combobox controlling a multi-select listbox (\`aria-multiselectable\`), with \`aria-activedescendant\` following the arrow keys and \`aria-selected\` on attached rows.
- Additions and removals are announced in a polite live region ("Added pricing.ts").
- Chips animate in and out with a short scale; under \`prefers-reduced-motion\`, fade only and skip layout animation.

## Related patterns
- **Attachment Chip** — Use it instead when the user is uploading files and needs upload progress and retry.
- **Connector Panel** — Use it as well to connect the apps whose documents appear under Connectors in the menu.
- **Context Usage** — Use it as well to show how much of the context window the attached sources take up.
- **Instruction Tool Insert** — Use it instead when @ should insert a tool or instruction into the prompt, not attach a source.
`;
