export const pattern = `# Code Preview Block

## Summary
A code block in an AI response that can flip between the source and a live rendering of it. When the model writes something renderable (an SVG, a self-contained HTML snippet), the user can see what it does in place, without copying it anywhere, then flip back to the code.

## When to use
- Assistant messages that contain renderable output: SVG icons and illustrations, HTML/CSS snippets, small widgets.
- Anywhere the visual result matters more than the text, but the user may still want to copy or check the source.

## When not to use
- Code that can't render on its own (a function, a config file, a React component without a runtime). Show a normal code block — a Preview button that renders nothing or errors breaks trust.
- Large, multi-file apps; use a full artifact/canvas view with its own panel instead.
- When previews would run untrusted code without isolation. If you can't sandbox it, don't offer it.

## Anatomy
- Header: a code glyph and the language name on the left; actions on the right.
- Code actions (code view only): wrap lines toggle, copy.
- View toggle: the right-most, filled round button. Shows a play glyph ("Preview") in code view, a code glyph ("Code") in preview view.
- Tooltips: a dark pill above each icon button, naming its action.
- Body: syntax-highlighted source, or a sandboxed frame with the rendered result centered on the block's background.

## Behavior
- Opens on the code by default (the model wrote code; show what it wrote). Pass \`defaultView="preview"\` when the rendering is the point.
- Preview swaps the body in place with a short cross-fade; the header stays fixed so the toggle doesn't move under the cursor.
- In preview the wrap and copy actions slide away — they act on text that isn't visible — leaving only the toggle back to Code.
- The toggle's glyph cross-fades and scales between play and code.
- Copy confirms with a check glyph and a "Copied" tooltip for ~1.5s.
- The preview renders in an iframe with \`sandbox\` and no \`allow-same-origin\`: SVG gets no script at all, HTML gets scripts but can't touch the host page, cookies or storage.
- SVGs are centered and scaled up to a readable size; \`currentColor\` takes the block's text color so the preview follows light/dark theme.
- Highlighting loads lazily; the plain source shows until it's ready, so the block never renders empty.

## Content guidelines
- Label the language plainly and in lowercase as written in the fence ("svg", "html").
- Tooltip names are verbs or the destination view: "Preview", "Code", "Copy", "Wrap lines".

## Accessibility
- Every icon button has an \`aria-label\` matching its tooltip; tooltips also show on keyboard focus.
- The wrap toggle exposes \`aria-pressed\`.
- The preview iframe has a \`title\` ("svg preview").
- Animated previews still respect the user's \`prefers-reduced-motion\` inside the frame if the generated code does; the block's own transitions are short opacity/scale fades.

## Related patterns
- **Diff Tabs** — Use it instead when the code is a change to existing files and people need to switch between diff views.
- **Drawing Icon** — Use it as well when the code is an animated SVG that is worth previewing live.
`;
