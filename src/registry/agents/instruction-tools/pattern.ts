export const pattern = `# Instruction Tool Insert

## Summary
A numbered instruction editor for an agent's playbook where typing \`/\` mid-sentence opens a two-step inline picker: first choose a tool ("Use Data Connector", "Read an attribute", "Escalate"…), then — for tools that need one — choose its target ("Get order info"). The result lands in the prose as an atomic chip ("**Use** Get order info ⋮"), so instructions read like natural language while referencing concrete, machine-resolvable actions.

## When to use
- Authoring agent or workflow instructions in plain language that must also bind to specific tools, connectors, attributes, or tags.
- When the set of tools is small and categorical, but each tool's targets are many and workspace-specific (connectors, fields, labels).
- When a step can mix several actions with free text ("Acknowledge the issue… **Use** Get order info, then **Tag** Damaged item").

## When not to use
- A chat composer whose / commands run immediately — use a command menu (Prompt Bar) instead; here, chips are *references* the agent resolves later.
- Rigid, fully structured workflows with branching — a node-based flowchart (Trigger Condition) shows control flow better than prose.
- When there is only one level of choice — skip the second step and insert the chip directly.

## Anatomy
- Numbered step list; each step is a rich-text line (Shift+Enter for a soft line break).
- Inline picker pill at the caret: \`/\` + search input. Step 1 placeholder "Search tools…"; step 2 shows the chosen verb in bold ("/**Use**") with a placeholder naming what to pick ("Select Data Connector…").
- Anchored menu below the pill: icon tile + label rows. Step 2 options carry their source app's icon/color, and an optional dashed-separated "Create new …" footer.
- Inserted chip: tool icon, bold verb, target label, and a ⋮ overflow menu (Change, Remove). The chip is atomic — it is deleted as a whole and its text is not editable.

## Behavior
1. Typing \`/\` at a word boundary (start of step or after whitespace) replaces it with the picker pill and focuses its search input. A \`/\` inside a word ("and/or", URLs) stays literal text.
2. Typing filters the menu; ↑/↓ move the highlight (hover also moves it), Enter/Tab or click selects.
3. Selecting a tool with targets swaps the pill to step 2 in place (menu cross-fades); a tool without targets ("Escalate") inserts its chip immediately.
4. Selecting a target replaces the pill with the chip (subtle spring scale-in) followed by a space, and returns the caret to the text right after it.
5. Backing out: Backspace on an empty search or Escape in step 2 returns to step 1; Backspace on empty step 1 removes the pill; Escape or blurring in step 1 restores the literal "/query" text so nothing typed is lost.
6. Chip ⋮ → Change reopens step 2 at the chip's position; Remove deletes it. Backspacing into a chip also deletes it whole.
7. Enter starts a new numbered step; Backspace in an empty step merges back into the previous one.
8. "Create new …" hands off to the host (\`onCreateOption\`) — don't build creation inline in the menu.

## Content guidelines
- Tool labels are verb phrases ("Use Data Connector", "Tag conversation"); the chip shows only the short verb ("Use", "Tag") so it reads as part of the sentence.
- Target labels are imperative and specific ("Get order info", "Transition issue to 'In progress'").
- Step-2 placeholders name the noun being picked: "Select Data Connector…", "Select attribute…".
- Keep the first-level list to ~5–7 tools; push breadth into step 2.

## Accessibility
- The search input is a \`combobox\` controlling a \`listbox\`; the highlighted row is exposed via \`aria-activedescendant\` so screen readers announce it while focus stays in the input.
- Menu rows are \`option\`s with \`aria-selected\`; mouse-down on the menu is prevented so clicking never steals focus or drops the picker.
- The chip's ⋮ is a real button with an accessible name ("Use Get order info options") and \`aria-haspopup="menu"\`.
- Everything is reachable by keyboard: / to open, arrows + Enter to pick, Escape/Backspace to step back.
- Serialize chips to structured segments (\`{ type: "tool", toolId, optionId }\`), never to their display text, so renames don't break instructions.

## Related patterns
- Prompt Bar — @ sources and / commands in a chat composer (single-step, executes immediately).
- Command Palette — global, modal command search.
- Create Agent / Agent Triggers — where these instructions typically live.
- Tool Call Chip — how the same tools appear once the agent actually runs them.
`;
