export const pattern = `# Autonomy Mode Switcher

## Summary
A mode control in the composer that sets how much the agent may do on its own for the next run — Suggest (it proposes, you apply), Confirm (it acts after you approve each step) or Execute (it acts and you can stop it). Each mode lists, per kind of action, whether the agent runs it, asks first or only suggests, so the choice is about concrete permissions rather than a vague "autonomy" slider. The current mode is always visible, and the most autonomous one looks different so it's never on by accident.

## When to use
- An agent can take actions with side effects (edit files, run commands, send, buy) and the right amount of oversight changes from task to task.
- The same person moves between exploring ("just tell me what you'd change") and delegating ("go do it").
- Per-action approval prompts are useful sometimes but too noisy for long runs, and people need a way to turn them down and back up.

## When not to use
- The agent only reads and answers. Without side effects there's nothing for the modes to govern.
- Permissions need to be set per tool or per resource ("can email this domain", "can spend up to $50"). Put that in a settings page; the switcher is a quick, coarse dial on top.
- A single risky action. Ask about that action with an approval prompt instead of changing the whole mode.
- Unattended or shared runs where nobody sees the composer. Set policy where the run is configured, and show it on the run.

## Anatomy
- Trigger: a pill in the composer toolbar with a level glyph (bars filling up to the current mode), the mode name and a chevron. In the highest mode it switches to a filled, high-contrast style.
- Menu: modes ordered from least to most autonomous. Each has the same level glyph, a name, one line on what the agent does, and a row of capability tags — Read files, Edit files, Run commands — each marked runs, asks or suggests.
- Legend: a footer that explains the three marks and the shortcut.
- Live region: announces the new mode and its one-line description on every change.

## Behavior
- The mode applies to the next message and stays until changed; show it in the transcript next to runs started in it, so the history says how each change happened.
- The menu opens upward from the composer. Arrow keys move, Enter picks, Escape closes back to the trigger.
- A shortcut cycles modes without opening the menu (⌘. / Ctrl+. here, as Windsurf does). Don't take Tab or Shift+Tab in a web page — they move focus.
- Default to the middle mode. Never move people up to the most autonomous mode automatically; going down (to Suggest) can happen on its own when something risky is detected, as long as it's announced.
- Switching modes mid-run takes effect at the agent's next step. Switching to a less autonomous mode turns the remaining steps into approvals or suggestions; it doesn't undo what already ran.
- Capability tags come from the same policy the agent enforces. If the menu says "Run commands: asks first", the agent must ask.

## Content guidelines
- Name modes after what the agent does, with verbs people already use: Suggest, Confirm, Execute — or Ask, Plan, Agent. Avoid levels with no meaning on their own ("Level 2", "Turbo").
- Descriptions say who does what in one line: "Reads and proposes changes. You apply them."
- Capability labels are short verb phrases for real action types ("Edit files", "Run commands", "Send email"), three to five of them.
- In the highest mode, remind people how to stop: "Stop it any time".

## Accessibility
- The trigger is a button with \`aria-haspopup="listbox"\`, \`aria-expanded\`, and an accessible name that includes the current mode ("Mode: Confirm").
- The menu is a listbox with \`aria-activedescendant\`; each option is described by its description and capability row, and each capability tag carries its permission as text ("Edit files: asks first"), not only a dot style.
- Mode changes, including ones from the shortcut, are announced in a polite live region.
- The highest mode differs by more than color — the filled style and the full level glyph both change — and passes contrast in both themes.
- The menu animation is a short fade and scale; disable it under \`prefers-reduced-motion\`.

## Related patterns
- **Tool Approval** — Use it as well: it's what Confirm mode shows for each step, and what any mode shows for an action its policy doesn't cover.
- **Plan Review** — Use it as well for a plan-first mode, where the agent writes a plan to approve before it acts.
- **Model Picker** — Use it beside the switcher; it chooses which model runs, not what that model may do.
- **Stop Generation Button** — Use it as well, so a run in the most autonomous mode can always be stopped.
`;
