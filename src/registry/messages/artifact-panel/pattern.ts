export const pattern = `# Artifact Panel

## Summary
A side panel that opens beside the chat to hold a substantial thing the model made — a document, a component, a diagram — so it can be read, versioned, copied and revised without scrolling the transcript. The message that produced it keeps a compact card that opens the panel; follow-up turns write new versions into the same panel instead of pasting the whole thing again.

## When to use
- The output is something people will keep and reuse (a plan, a page of code, an HTML app, a diagram), not an answer to read once.
- The output is long enough that showing it inline would push the conversation off screen — roughly more than a screen of text or a dozen lines of code.
- People will iterate on it over several turns ("make it shorter", "add a pricing section") and need to compare versions.
- The output renders into something other than text (a live preview of a component, a chart), where a preview and its source are both useful.

## When not to use
- Short answers, snippets or a few lines of code — keep them inline. A panel for a three-line reply is a detour.
- Content the user is meant to read in the flow of the conversation (an explanation, a summary). Put it in the message.
- When the product already has a document or editor surface. Write into that surface directly instead of a second, parallel one.
- When the screen is too narrow for two columns and the artifact is not the main point — an inline expandable block costs less than covering the chat.

## Anatomy
- Artifact card: in the message that created the artifact — a type icon, the title, the type and version ("Document · v2") and an open affordance. One card per version-producing message, so the transcript shows where each version came from.
- Panel: beside the chat on wide screens, covering it on narrow ones.
- Header: the title, a one-line note on what this version changed, a version stepper ("v2/2"), Copy and Close.
- View tabs: Preview and Code, shown only when the artifact has source behind its rendering.
- Body: the rendered artifact or its source, scrolling on its own.
- Writing state: a thin indeterminate bar and a dimmed body while a new version is being written.

## Behavior
- The panel opens automatically when the model starts writing an artifact, and on demand from any card. Opening an older message's card shows that message's version.
- A follow-up that changes the artifact adds a new version and switches the panel to it. Earlier versions stay reachable from the stepper; nothing is overwritten.
- While a new version is written, the previous one stays visible but dimmed, so the user never looks at an empty panel. Don't let them edit a version that is being replaced.
- Side by side from about 42rem of container width; below that the panel covers the chat and Close returns to it. Size the split by the container, not the viewport, so the pattern also works inside a narrow pane.
- Escape and Close collapse the panel and return focus to the card that opened it. The chat column keeps its scroll position.
- Copy copies the current version's source, and confirms in place ("Copied") for a moment.

## Content guidelines
- Titles name the thing, not the request: "Q3 beta launch plan", not "Here's your plan".
- Version notes say what changed in a few words ("Shorter, one screen", "Added pricing"), not "Updated version".
- The message that carries the card says what the artifact is or what changed in a sentence. Don't repeat the artifact's content in the message.
- Type labels are concrete ("Document", "React", "HTML", "Diagram"), never "Artifact".

## Accessibility
- The card is a real button with \`aria-expanded\` reflecting whether its panel is open.
- The panel is a labelled \`aside\` (named by its title). On open, focus moves to the title; on close, it returns to the opening card.
- Preview and Code use the tabs pattern: \`role="tablist"\`, \`aria-selected\` on each tab, and a labelled \`tabpanel\`.
- The version label and the "Writing a new version…" note sit in polite live regions so version changes are announced; the body is \`aria-busy\` while writing.
- Icon-only buttons (previous, next, copy, close) carry accessible names. Respect \`prefers-reduced-motion\`: fade the panel in instead of sliding it.

## Related patterns
- **Code Preview Block** — Use it instead for a short snippet that should stay inline in the message.
- **Diff Tabs** — Use it as well when the artifact is code and people need to see what changed between versions.
- **Selection Actions** — Use it inside the panel so people can select a passage and ask for a change to just that part.
- **Conversation Branches** — Use it instead when people want alternative replies to one prompt, not successive versions of one thing.
`;
