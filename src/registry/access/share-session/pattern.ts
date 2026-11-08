export const pattern = `# Share Session

## Summary
A small dialog for choosing who can see an agent session: Private (only you) or Public (anyone with the link). Agent sessions carry more than a chat: code from the repositories they worked in, file contents, command output. So the dialog states what going public would expose before the person chooses, not after. The link appears only once it actually works.

## When to use
- People want to show a session to someone else: a teammate, a reviewer, a public post about how they built something.
- Sessions can contain material whose sharing rules come from elsewhere (a private repository, an internal workspace, uploaded files).
- Access is all-or-nothing via a link rather than per-person.

## When not to use
- Access is granted to named people with roles. Use **Invite Members**.
- The person wants to share one output (a file, a reply, an artifact), not the whole session. Share that object instead.
- Sharing is controlled by an admin or policy and the person can't change it. Show the current state as read-only and say who decides.

## Anatomy
- Title and one-line description of what sharing is for ("Show your work and how you build with the agent.").
- Close button.
- Visibility options: a radio group of rows, each with an icon, a label and one line saying who can see it. The selected row is filled and has a check.
- Link row (Public only): the URL and a Copy link button.
- Policy note: a short line about not sharing personal or third-party content, linking to the usage policy.
- Exposure warning: a bordered box with a warning icon that names what the session would expose ("This session comes from a private repository. Sharing it can expose the code to anyone with the link.").

## Behavior
- Default to Private. Never make a session public without the person choosing it.
- Choosing an option saves at once; there's no separate Save. A small spinner replaces the check on that row until it's saved.
- The link row appears only after Public is saved, so a copied link never points to a private session.
- Switching back to Private revokes the link for everyone at once; say so in the option description or a toast if links may already be out.
- The exposure warning is computed from the session (its repositories, uploads, connectors) and shown whenever there's something to warn about, in both states, so the person reads it before choosing Public.
- Escape, the close button and a click outside close the dialog. Focus starts on the selected option and returns to the Share button on close.

## Content guidelines
- Describe each option by who can see it: "Only you have access", "Anyone with the link can view".
- Make the warning concrete: name the source and the consequence ("a private repository… expose the code"), not "may contain sensitive data".
- Keep the policy note to one sentence with a link; the dialog isn't the place for the full policy.
- Say "Copy link", then "Copied" for a moment; don't open a separate toast for it.

## Accessibility
- The dialog has \`role="dialog"\`, \`aria-modal="true"\` and is labelled by its title and described by its description; focus is trapped inside it.
- Options are a \`role="radiogroup"\` of \`role="radio"\` items with \`aria-checked\`, a roving tab stop and arrow-key selection.
- The Public option is linked to the exposure warning with \`aria-describedby\`, so the warning is read before choosing it.
- "Link copied" is announced through a polite live region. Motion reduces to fades under \`prefers-reduced-motion\`.

## Related patterns
- **Invite Members** — Use it instead to give named people access with roles.
- **Archived Session** — Use it as well: shared sessions stay readable after they're archived.
- **Incognito Toggle** — Use it as well to keep a session out of history, and out of sharing, from the start.
- **AI Disclosure Badge** — Use it on the shared page to mark what the agent wrote.
`;
