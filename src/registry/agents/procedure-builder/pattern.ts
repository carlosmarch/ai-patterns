export const pattern = `# Procedure Builder

## Summary
A document-style editor for writing the step-by-step procedure an AI agent follows — numbered instructions in plain language, IF / ELSE branches, section headers, jumps between sections, and terminal actions like Escalate or Switch procedure. Steps are added from a "/" picker, so authoring feels like writing a doc rather than wiring a flowchart, while the result is still structured enough for the agent to execute deterministically where it matters.

## When to use
- Configuring how an agent handles a multi-step support or operations task (refunds, damage claims, account changes) where some steps are judgment calls and some are hard rules.
- When the people writing the procedure are domain experts, not engineers — plain-language instructions and conditions are the default, code is opt-in.
- When branching is shallow (one level of IF / ELSE) and the procedure reads top to bottom.

## When not to use
- Deeply nested or parallel logic, loops, or many-way merges — use a canvas-based Flowchart, where the shape of the graph is the point.
- A single prompt or persona with no ordered steps — a plain instructions field is enough.
- Automations with no AI judgment at all (every condition is a field comparison) — a rules or workflow builder is more honest about what runs.

## Anatomy
- A numbered list of steps (1, 2, 3…). Section headers are unnumbered and break the list into named parts.
- Instruction step: free text describing what the agent should do. Can contain inline reference chips — a bold verb plus a target ("**Update** Resolution method", "**Tag** Refund initiated", "**Use** Order replacement", "**Read** ETA") — for the data, tools, and tags the instruction touches.
- Condition step:
  - An "IF" header with a violet branch badge and a ⋮ menu (add/remove ELSE, switch between plain language and code, delete).
  - A bordered condition field — prose by default, or a syntax-highlighted expression in code mode, toggled with a \`<>\` button in its corner.
  - A lettered sub-list (A, B, C…) of steps to run when the condition holds, hung off a vertical rail that ends in a "+" button.
  - An optional "ELSE" header with the same rail, sub-list, and "+" button.
- Go to step: a blue badge, "Go to", and a picker of the procedure's section headers.
- Action steps: an orange badge marks steps that hand control elsewhere — "Escalate to [team]", "Switch to [procedure]", "Run [workflow]", "End procedure".
- The step picker: a "/Search steps…" input with a menu grouped into structure (Instruction, Condition, Section header, Go to) and, below a divider, actions (Escalate, Switch, Run workflow, End).

## Behavior
- "Add step" at the bottom of the procedure, or the "+" at the end of a branch rail, opens the step picker at that position with focus in the search input. Only one picker is open at a time.
- Typing filters the menu; Arrow keys move the highlight, Enter or a click inserts that step type in place of the picker. Escape, Backspace on an empty search, or moving focus away removes the picker without adding anything.
- Inside a branch the picker offers a reduced menu — no Condition or Section header — because branches are one level deep and sections belong to the top level. Labels get more explicit there ("Go to section", "End procedure").
- Choosing Condition inserts the IF block with focus in the condition field and one empty sub-step whose placeholder explains its role: "Describe what the agent should do when this condition is met."
- Choosing Go to, Escalate, Switch, or Run workflow opens its target picker immediately, since the step is incomplete without one.
- In an instruction, Enter opens the step picker on the next line, Shift+Enter adds a line break, Backspace on an empty instruction deletes it, and "/" in an empty instruction swaps it for the picker — the same muscle memory as block-based docs.
- Go to targets are bound to section headers by identity, not text: renaming a section updates every step that points at it, and deleting a section clears those targets rather than leaving a dangling jump.
- Numbering is derived from position and updates live as steps are added, removed, or branched.
- New steps fade and slide in a few pixels; removed steps fade out and the rest of the list glides into place. Menus scale in from their anchor. Motion is short (≤200 ms) so it never delays typing.
- Every non-condition step reveals a remove button on hover or focus; conditions are removed from their ⋮ menu.

## Content guidelines
- Write instructions as direct imperatives to the agent: "Explain that a reorder can't be placed due to policy," not "The agent should maybe explain…".
- Plain-language conditions should name the observable evidence and give examples ("the image clearly shows spilled or leaking packaging, e.g. sauce, soup, drinks"). Vague conditions produce inconsistent branching.
- Reach for code conditions only for hard thresholds — dates, totals, counts — that must never be left to judgment. Use dotted, human-readable field paths (\`order.total\`, \`policy.auto_approve_limit\`).
- Name sections by the goal of that part of the procedure ("Verify the claim", "Offer a resolution") so Go to steps read as sentences.
- End every branch with a clear outcome — a resolution, a Switch, an Escalate, or End — so the agent never falls off the end of a branch ambiguously.

## Accessibility
- The procedure is an ordered list (\`<ol>\`) and each branch is a nested ordered list, so screen readers announce position and nesting; visual markers ("3.", "A.") are \`aria-hidden\` duplicates of that structure.
- The step picker input is a \`combobox\` with \`aria-expanded\`, \`aria-controls\`, and \`aria-activedescendant\` pointing into a \`listbox\` of \`option\`s; the highlight follows the keyboard, not just the pointer.
- Target pickers are buttons with \`aria-haspopup="listbox"\`; the list takes focus on open, supports Arrow keys / Enter / Escape, and returns focus to the button on close.
- The ⋮ menus are \`aria-haspopup="menu"\` buttons with \`role="menu"\` / \`menuitem\` items, roving focus with Arrow keys, Home / End, and Escape to close.
- Every field has an accessible name even though its visible label is a placeholder; the code toggle is a toggle button with \`aria-pressed\`. Hover-only controls (remove, code toggle) also appear on keyboard focus.
- Syntax highlighting in code mode is a decorative overlay; the underlying textarea holds the real text, so it remains editable and readable by assistive tech.

## Related patterns
- Flowchart — the canvas alternative for logic whose shape matters more than its wording.
- Create Agent and Agent Triggers — decide when an agent runs; a Procedure Builder decides what it does once running.
- Command Palette — the same search-and-pick interaction, applied to navigation instead of insertion.
`;
