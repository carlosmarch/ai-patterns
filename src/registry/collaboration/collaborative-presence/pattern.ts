export const pattern = `# Collaborative Presence

## Summary
An avatar stack that communicates two things at once: who has access to a shared project, and who is actively viewing it right now. The access list is always shown so the component is meaningful even when no one else is online. Online avatars are visually distinguished with a colored ring and a green dot. This "presence on top of access list" approach is the same convention used by Google Docs, Figma, and Notion, adapted for async B2B workflows where concurrent viewers are infrequent.

## When to use
- A project or document is shared across a fixed team working asynchronously.
- The product has a real-time presence signal scoped to who is currently viewing a specific item — not just who is logged in.
- The team is small enough (typically 2–10 people) that individual avatars are recognizable and meaningful.
- Knowing "who's involved" has persistent value, not just when others happen to be online.

## When not to use
- The item has no access control (everyone can see it) — use a viewer count or activity feed instead.
- Teams are so large (50+) that the avatar stack conveys nothing meaningful.
- Real-time presence is not technically available — showing only an access list without a presence signal produces a static component that doesn't justify its space.
- Consumer social products where follower counts matter more than specific collaborator identity.

## Anatomy
- **Avatar stack** — overlapping circular avatars in online-first order, up to the visible cap (default 4). The full group (stack + overflow chip) is a single button that toggles the detail panel.
- **Presence ring** — an emerald ring wrapping each avatar whose collaborator is currently viewing the item.
- **Online dot** — a small green dot at the bottom-right corner of each online avatar; backs up the ring with a redundant signal that does not rely on color alone.
- **Offline dimming** — avatars for collaborators not currently viewing appear at ~55% opacity, receding without disappearing.
- **Overflow chip** — a "+N" circle shown only when the collaborator count exceeds the visible cap. Hovering shows a tooltip: "N more · click to see all."
- **Detail panel** — an inline (not floating) panel that expands below the stack, pushing page content down. Lists all collaborators in online-first order with avatar, name, role, and a text status label.
- **Tooltip** — appears above an individual avatar on hover. Shows name on line one, and "Role · Online now" or "Role · Has access" on line two. Fades in with a slight nudge. Suppressed while the detail panel is open.

## Behavior

### Ordering
Online collaborators sort to the front of the stack. Within each group the order is stable. The stack should never be empty — show the current user's avatar even if they are the only person with access.

### Overflow surfacing
When a collaborator inside the overflow chip comes online they surface to the front of the visible stack via the join animation, and whoever was previously in the last visible slot moves to overflow. The "+N" count stays the same. The displaced avatar requires no explicit exit animation. The reverse (going offline while visible) lets the stack re-settle naturally without pulling an overflow collaborator forward.

### Join animation
The avatar appears at scale 0.5 / opacity 0 and springs to full size as the ring and dot fade in. Existing avatars slide to make room. Duration: ~300 ms (spring, stiffness 380, damping 28).

### Leave animation
The avatar shrinks and fades (scale 1→0.5, opacity 1→0) and settles into its new offline position. The ring and dot disappear with a separate scale-out transition.

### Detail panel
Opens inline on click, pushing page content down. Shows all collaborators in online-first order with avatar, name, role, and status label. A summary line at the top shows the counts: "2 online now · 5 with access." Clicking the avatar group again or clicking outside closes the panel. If presence changes while the panel is open the list re-sorts in place without requiring the user to reopen it.

### Hover tooltips
On desktop, hovering an avatar shows a tooltip above it with the collaborator's name and status. Tooltips are suppressed while the detail panel is open. On touch devices, tapping the group goes directly to the panel.

## Content guidelines
- Panel status labels: "Online" and "Has access."
- Tooltip status: "Role · Online now" or "Role · Has access" (tooltip uses the longer form for clarity on hover).
- Overflow tooltip: "N more · click to see all."
- Panel summary line: "2 online now · 5 with access." Use plain numbers, not percentages.
- Avatar initials: two characters maximum (first-name initial + last-name initial).
- If exactly one person has access, show their avatar alone — never leave the slot empty.

## Accessibility
- The entire avatar stack renders as a single \`<button>\` with \`aria-label="View collaborators"\` and \`aria-expanded\` reflecting the panel state.
- The detail panel is linked via \`aria-controls\` pointing to the button's \`id\`.
- Presence is not communicated by color alone: the panel provides text labels for every collaborator, and the tooltip repeats the same information on hover.
- The ring and online dot are decorative (\`aria-hidden\`); the panel list is the authoritative accessible representation.
- Avatar initials must maintain WCAG AA contrast against their background color.
- All animations should respect \`prefers-reduced-motion\`.

## Related patterns
- **Invite Members** — the access management counterpart; opens a modal to add or remove people from the same project. Typically placed adjacent to this component.
- **Sources Stack** — same overlapping circular group visual applied to source favicons. Shares the overlap, cap, and "+N" overflow conventions.
`;
