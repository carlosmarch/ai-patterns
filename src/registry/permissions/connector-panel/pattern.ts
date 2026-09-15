export const pattern = `# Connector Panel

## Summary
A structured settings panel for connecting and configuring an external app or MCP server with an AI agent. It shows what the integration can do (overview bullets and links in a sidebar), lists every tool the integration exposes grouped by capability, and lets users set per-tool or per-group permission levels — Disable, Always ask, or Allow — without leaving the panel. The header carries the app identity (name, verified badge) and an Add connector CTA; a sidebar holds discovery content; the main column offers search and group filtering over the tool list.

## When to use
- When onboarding a new MCP server or reviewing an existing integration's permissions before activating it.
- When users need to browse what an integration can do and control exactly which tools it may run autonomously, run after confirmation, or never run.
- In an agent settings area, marketplace, or connector catalog — not inline in an agent chat transcript.

## When not to use
- For in-transcript per-call approval (one tool, one moment) — use Tool Approval instead. This panel manages standing permissions, not live prompts.
- As a generic settings form or feature-flag manager unrelated to agent tool permissions.
- When the integration exposes only one or two tools — a simple toggle row suffices; the full panel layout is only worth its overhead at five or more tools.

## Anatomy
- **Header**: app icon, name, verified badge (if publisher-verified), one-line description, "Add connector" CTA, close button.
- **Sidebar**: "Overview" section — a short bullet list of capabilities phrased from the user's perspective; "Links" section — anchor links to the app's website and documentation.
- **Filter bar**: Group filter dropdown (All + each group name) and a text search that matches on tool name or description.
- **Tool group section**: a collapsible label row showing the group name and a group-level "Allow" button that disappears once every tool in the group is allowed; below it, one tool row per tool.
- **Tool row**: tool name, protocol badge (e.g. "MCP"), description, and a three-way permission toggle (Disable / Always ask / Allow).

## Behavior
- Search immediately filters tool rows by name or description substring across all groups.
- The group dropdown constrains the visible groups; combining it with search narrows within that group.
- The group-level "Allow" button sets every tool in the group to Allow in one action.
- Per-tool permission is a mutually exclusive three-way toggle: only one of Disable, Always ask, Allow is active at a time.
- Groups are individually collapsible; collapsing hides tool rows without changing their permissions.
- The panel is layout-agnostic — it can be rendered as a modal (with a backdrop owned by the caller) or embedded directly in a settings page.

## Content guidelines
- Overview bullets phrase capabilities from the user's perspective: "Access deployment logs for debugging", not "Provides log access".
- Tool names match the tool's identifier exactly — no paraphrasing.
- Tool descriptions state what the tool does, not why the agent would use it ("Generate a temporary shareable link…", not "Useful for sharing protected pages").
- The verified badge appears only when the publisher's identity has been confirmed — don't use it as a general quality signal.
- Protocol badges ("MCP") are short, literal, and uppercased.

## Accessibility
- The permission toggle group for each tool uses \`role="group"\` with \`aria-label\` naming the tool ("Permission for Check domain availability").
- Each permission button exposes its active state via \`aria-pressed\`.
- The verified badge icon carries \`aria-label="Verified"\` so it's not invisible to screen readers.
- Group collapse buttons set \`aria-expanded\` to reflect the open/closed state.
- The group filter dropdown follows the listbox disclosure pattern: \`aria-haspopup="listbox"\`, \`aria-expanded\`, closes on Escape or outside click.
- The search input has \`aria-label="Search tools"\`.

## Related patterns
- Tool Approval — per-call in-context permission prompt; this panel manages standing permissions set before calls happen.
- Agent Triggers — similar two-column layout (sidebar overview + main content) for agent configuration.
`;
