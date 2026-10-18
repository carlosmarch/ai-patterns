export const pattern = `# Prompt-Driven Onboarding

## Summary
A first-run setup screen that replaces "read the docs, find the SDK, copy the code, figure out where it goes" with a single, pre-filled prompt the user pastes into their AI coding agent (Cursor, Claude Code, etc.). The agent reads the user's actual codebase and performs the integration. The product then listens for the first real signal — an event, request, or webhook — and confirms setup is complete. The shift is from "here's how to set up our product" to "here's a prompt that sets up our product for you."

## When to use
- Developer tools, APIs, SDKs, analytics, monitoring, auth, payments — any SaaS whose activation step is "add code to your app".
- Setup that varies by framework or project structure, where a static snippet forces the user to translate it to their stack.
- Products that can detect success on their side (first event ingested, first API call, first webhook delivered), so the screen can close the loop.

## When not to use
- No-code products or setups done entirely in your own UI — there's no codebase for an agent to work in.
- Integrations that are a single, universal line (a script tag with no options) — a snippet is faster than a prompt.
- Audiences unlikely to use AI coding tools, or regulated environments where agents can't touch the codebase. Keep the snippet path, and consider making it the default there.
- Don't drop the manual path entirely: the prompt is the recommended route, not the only one.

## Anatomy
- **Header**: outcome-oriented title ("Let's get data in") and a masked **API key chip** with copy.
- **Recommended method card**: visually emphasized (accent border/glow) with a "Recommended" badge.
  - **Method toggle**: "AI prompt" / "Snippet" segmented control — the classic code path stays one click away.
  - **One-line explainer**: what to do with the prompt and what it will do.
  - **Prompt preview**: monospace block, collapsed to the first lines with a fade and an expand control.
  - **Actions**: an "Open in <tool>" split button (default tool + menu of other agents) and a primary **Copy prompt** button.
- **Alternatives**: divider ("or set up another way") followed by cards for non-code routes — integrations/import, or inviting a teammate to do it.
- **Status footer**: live listening indicator ("Waiting for your events…"), a **Skip for now** link, and a **Finish setup** button that stays disabled until the first signal arrives. Both are optional — drop them when the card stands alone with no next step (e.g. a docs page), and let the status line carry the confirmation.

## Behavior
- The prompt is generated per account/project: it embeds the API key, project/environment name, and any choices made earlier in onboarding. It should never be a generic doc excerpt.
- The prompt states the goal and the definition of done first ("one real, app-produced first event, ingested into project X"), then concrete steps: detect the stack, install, initialize once at the entry point, track a meaningful event, run it, and summarize changes.
- **Copy prompt** writes to the clipboard and swaps its icon/label to "Copied" for ~1.5s.
- **Open in <tool>** deep-links into the selected agent with the prompt prefilled when the tool supports it; otherwise copy and show a short "paste it into <tool>" hint. The menu remembers the last-chosen tool.
- Switching to **Snippet** swaps the preview and copy action in place; the "Open in" button hides since there's nothing for an agent to run.
- The footer listens continuously (polling or a live connection). When the first signal lands, the pulsing dot settles into a success state, the label changes ("First event received"), and **Finish setup** enables. Don't auto-advance — let the user see the confirmation.
- **Skip for now** exits without penalty; re-surface the step later (e.g. via a setup checklist).

## Content guidelines
- Title names the outcome, not the task: "Let's get data in", "Send your first request" — not "Install the SDK".
- Explainer: one sentence, name example tools ("an AI coding tool like Cursor or Claude Code").
- Prompt: plain imperative language, numbered steps, explicit success criterion. Instruct the agent to keep secrets in env vars rather than hard-coding keys in client code, and to report what it changed so the user can review the diff.
- Keep the preview short when collapsed; the user should grasp the goal from the first line.
- Status labels are specific to the signal: "Waiting for your events…", "Waiting for your first API call…".

## Accessibility
- The method toggle uses \`role="tablist"\`/\`role="tab"\` with \`aria-selected\`; the preview is the \`tabpanel\`.
- The expand control has \`aria-expanded\` and an accessible name ("Show full prompt").
- The tool menu trigger has \`aria-haspopup="menu"\` and \`aria-expanded\`; items are \`menuitemradio\` with \`aria-checked\`; Escape and outside click close it.
- The status line is an \`aria-live="polite"\` region so the "received" transition is announced.
- The disabled Finish button must still be discoverable — keep the status text adjacent explaining what it's waiting for.
- Respect \`prefers-reduced-motion\` for the pulsing dot and icon swaps.
- The API key is masked visually; the copy button's label announces success ("API key copied").

## Related patterns
- Setup Checklist — re-surfaces this step if the user skips it.
- Terminal Stream / Background Tasks Drawer — if the product runs its own agent instead of handing the prompt off.
- Tool Approval — what the user will see inside their coding agent as it applies the setup.
`;
