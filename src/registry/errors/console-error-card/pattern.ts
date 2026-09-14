export const pattern = `# Console Error Card

## Summary
A structured card that surfaces a browser console error or warning inside an AI product's interface. Shows a human-readable error message, an inline code frame pointing to the offending line, a collapsible call stack, and optional navigation across multiple errors — letting the user inspect, copy, and dismiss without leaving the conversation.

## When to use
- When an AI coding assistant detects a runtime error in the user's running application and needs to show it contextually alongside the conversation.
- When surfacing errors collected from a browser session, a test run, or a build log that the AI is helping the user debug.
- When there are multiple errors to navigate through (1/N pattern) and the user needs to triage them one at a time.

## When not to use
- Quota or rate-limit errors — use the Rate Limit pattern instead.
- Simple one-line error toasts that don't need code context — use a standard alert or toast.
- Full-screen error pages (unrecoverable crashes) — this card is for inline, dismissible inspection, not for blocking states.
- Compiler or build errors without a known line number — omit the code frame; don't show an empty frame.

## Anatomy
- **Top bar**: navigation arrows (previous / next) and a "1/N" counter for multi-error sessions; a severity badge ("Console Error" in red, "Console Warning" in amber); copy and close action buttons.
- **Error message**: the raw error text, rendered in the severity color. Should be scannable at a glance.
- **Code frame**: file path and line:col reference in the header; a small window of source lines with the error line highlighted and a ">" gutter indicator; an optional "Open in editor" affordance.
- **Call Stack**: a collapsible section with a frame count badge. Each frame shows the function name, an optional anonymous-context label, and the file path. Hidden by default to reduce visual weight.
- **Helpful footer**: thumbs-up / thumbs-down feedback, revealed only when \`onHelpful\` is wired up. Lets the product collect signal on error surface quality.

## Behavior
- Navigation arrows are disabled when at the first or last error; they are hidden entirely when \`total\` is 1.
- The call stack collapses with a height animation (Motion \`AnimatePresence\`). Opening it does not shift the surrounding layout unexpectedly — use overflow-hidden during transition.
- Copying triggers a brief checkmark-swap animation on the copy icon (≈1.5 s), then reverts. No toast is needed — the icon change is the confirmation.
- The helpful-vote buttons toggle \`aria-pressed\` and apply a color accent on selection; voting again on the same choice has no effect (idempotent).
- Closing fires \`onClose\` and is the caller's responsibility — the card itself does not unmount; wrap it in \`AnimatePresence\` if you need an exit animation.

## Code frame guidelines
- Show 3–6 lines of context around the error line; 2 lines before and 2 after is a good default.
- Always include the line number and column in the file header (\`path/to/file.tsx (line:col) @ FunctionName\`).
- Highlight only the single error line — highlighting a range suggests a range selection, which is misleading.
- If the source is not available, omit the \`frame\` prop entirely rather than showing a placeholder.

## Content guidelines
- Error message: verbatim from the console, no paraphrasing. The stack trace may rephrase, but the top-level message must be exact so the user can search for it.
- Badge label: "Console Error" or "Console Warning" — not "Runtime Error", "JS Error", or anything branded.
- Call stack frame names: use the function/component name as it appears in the source, not the mangled bundler name. If the frame is anonymous, show \`<anonymous>\` literally.
- "Was this helpful?" — only show this when the AI generated the error diagnosis. Don't ask for helpfulness on raw errors the AI simply forwarded.

## Accessibility
- The card root should have \`role="alert"\` when it appears dynamically so screen readers announce it immediately.
- Navigation buttons have \`aria-label="Previous error"\` / \`aria-label="Next error"\`.
- The call-stack toggle button has \`aria-expanded\` tracking the open state.
- Thumbs buttons have \`aria-label\` ("Yes, helpful" / "Not helpful") and \`aria-pressed\` for toggle semantics.
- The code frame is \`aria-hidden\` to screen readers if the full error message already conveys the problem — avoid reading out raw code lines.

## Related patterns
- Rate Limit — for quota-based errors, not runtime errors.
- Partial Response — for responses cut short by token or context limits.
- Terminal Stream — for streaming build/test output where errors surface in line.
`;
