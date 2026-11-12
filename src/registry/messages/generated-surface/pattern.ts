export const pattern = `# Generated Surface

## Summary
A frame in the transcript for interface the model built for one answer: a small app, a picker, a simulation, an interactive explainer. The model writes the page; the frame is the fixed part around it. It runs the page in a sandbox, marks it as generated, shows it filling in while it builds, catches its runtime errors, keeps its versions, and always offers the same answer as plain text. The page changes with every prompt. The frame never does, so people always know where the generated part starts and what they can do about it.

## When to use
- The answer is better used than read: a comparison to drag, a calculator, a timeline to scrub, a small game or simulation.
- The model writes HTML, CSS and JavaScript for the answer at request time, and you render it in the product.
- Generation takes long enough (tens of seconds or more) that people should see the page take shape instead of a spinner.
- The generated code can fail at runtime, and you want failures caught and repaired instead of a silently dead control.

## When not to use
- Answers that read fine as text, a list or a table. A generated app for a one-line fact makes people wait for nothing.
- Something people will keep, edit and come back to across turns, like a document or a component. Use an Artifact Panel.
- A short snippet whose source matters as much as its rendering. Use a Code Preview Block.
- Controls that must look and behave the same every time: approvals, stop, payments, permissions. Never let the model generate those. Keep them in the product's own UI, outside the frame.
- When you can't sandbox the page (no isolated origin or iframe), don't render model-written scripts at all.

## Anatomy
- Header: a "Generated" label, the title of the thing built, and a status line ("Building · Wiring the slider", "Ready", "1 issue").
- View / Text switch: the interactive page, or the same answer as plain content.
- Version stepper ("v2/2"), shown once there is more than one version.
- Issue bar: shown when the page reported an error, with a plain sentence, collapsible raw details, "Show as text" and "Fix it".
- Body: the sandboxed page, sized to its content up to a maximum height, then scrolling inside. A thin indeterminate bar along its top edge while building.
- Footer: a provenance line ("Built by AI for this answer. Its controls only change this view.") and what the page was based on.

## Behavior
- **Sandbox.** Run the page in an iframe with scripts allowed but no same origin, so it can't read the host's cookies, storage or DOM, or navigate the top window. It talks to the frame only through messages, and the frame accepts messages only from its own iframe's window.
- **Build in the open.** Show a skeleton first, then the partial page at section boundaries (layout, then content, then interactions), with the current step in the status line. Don't swap in the document per token. Every swap reloads the page and makes it flicker.
- **Partial pages are usable.** People can scroll and read what's already there. Inputs that aren't wired yet should look disabled, not broken.
- **Catch failures.** An injected reporter forwards uncaught errors and rejected promises. Once building ends, any error turns the status into "N issues" and opens the issue bar. Don't show errors from a page that is still being written.
- **Repair is a new version.** "Fix it" sends the reported errors back to the model, keeps the old page visible under the building bar, then switches to the new version. The broken one stays reachable in the stepper. Nothing is overwritten.
- **Text is always there.** The Text view shows the same answer as accessible, plain content. Keep the page mounted underneath so switching back doesn't reset what someone set.
- **Match the host.** Pass the host's colours and font into the page as CSS variables, and post updates when the theme changes instead of reloading.
- **Height.** The page reports its height and the frame follows it, up to a cap. A hidden page reports zero. Keep the last real height.

## Content guidelines
- The title names what was built ("Wait pattern picker"), not the request.
- The message above the frame says in one sentence what to do with it ("drag to your typical generation time"). Don't repeat the page's content in prose.
- Status steps describe the work in the person's terms ("Laying out the picker"), not the pipeline ("Calling /gen").
- The issue sentence says what it means for them ("some controls may not respond"). Keep stack traces behind Details.
- The provenance line is short and constant. Don't let the generated page restyle or replace it.

## Accessibility
- The frame is a labelled \`section\`, and the iframe has a \`title\` matching the header title.
- The status line is a polite live region, so building steps, "Ready" and issues are announced. The body is \`aria-busy\` while building.
- View / Text are toggle buttons with \`aria-pressed\`. The version stepper's buttons have names, and the version label is announced.
- The Text view is the guaranteed accessible path. Generated pages vary in quality, so never let them be the only way to get the answer.
- Ask the model for real labels, \`alt\` text and keyboard-operable controls inside the page, and respect \`prefers-reduced-motion\` both in the frame and in the page.

## Related patterns
- **Artifact Panel** — Use it instead when the output is something to keep and revise over many turns.
- **Code Preview Block** — Use it instead for a short snippet where the source is part of the answer.
- **Console Error Card** — Use it as well when people need the full error, code frame and stack, not just a summary.
- **Thinking Loader** — Use it instead of the building bar when the page arrives in a few seconds.
- **Response Compare** — Use it as well to compare a generated surface with the plain answer.
`;
