export const pattern = `# Listening State

## Summary
A dedicated visual state — a pulsing mic glyph with an outward ripple, a status label, and a stop control — that tells the user the system is actively capturing their voice right now. It's the "your mic is live" moment in a voice interface, distinct from showing what was heard (Live Transcript) or how loud it is (Voice Waveform).

## When to use
- The instant a voice interface starts capturing audio, whether triggered by a push-to-talk press, a wake word, or an always-on mode — show this before or alongside any transcript text appears.
- As the anchor state users glance at to confirm "yes, it's hearing me" separate from reading a waveform or transcript, especially for brief utterances where a transcript hasn't rendered yet.
- Any time capture is paused (muted, held) but the session is still open — use the inactive variant rather than removing the component entirely, so the control to resume stays in place.

## When not to use
- While the assistant is talking, not the user — this state specifically means "capturing your voice." Use a distinct speaking indicator (e.g. Voice Waveform in its \`speaking\` state) for that half of the turn.
- As a permanent idle-mode decoration when no capture session is open — it implies the mic is live; don't show it before the user has actually started or been prompted to speak.
- Stacked with a second, separate ripple/pulse indicator for the same mic state — one active listening indicator per view.

## Anatomy
- Mic glyph: a solid-filled circular button with a microphone icon, tinted with an accent color while active and muted gray when paused.
- Ripple: a single ring, sized and centered on the glyph itself (not a separate oversized container), that expands outward a short distance and fades to nothing, looping continuously. Keep the ripple's max size close to the glyph's own footprint — a ring that balloons far past it can visually collide with the label sitting just below.
- Status label: a short live-updating phrase ("Listening…", "Paused") directly below the glyph.
- Stop control: a small button beside the label that ends capture — always reachable without needing to find a separate toolbar.

## Behavior
- The ripple only animates while \`active\` is true; pausing or muting freezes the glyph in a flat, static state with the ripple removed rather than slowed down, so "paused" is unambiguous at a glance.
- Clicking stop ends the capture session immediately — no confirmation step, since capture is easy to restart and holding it hostage behind a dialog adds friction to a moment that's meant to feel instant.
- The label updates in place (no layout shift) when switching between active and paused text.
- On resume, restart the ripple animation from its initial state rather than resuming mid-cycle, so the "just started listening" cue is clear each time.
- Drive the ripple with a plain keyframe \`animate\` (e.g. scale \`[1, 1.4]\`, opacity \`[0.6, 0]\`) rather than a separate \`initial\` prop plus a per-instance \`delay\` — the same technique Prompt Bar's dictation mic uses. Staggering multiple rings via \`delay\` on an infinitely-repeating animation is fragile and prone to drifting out of sync; one ring on a clean loop reads just as clearly as "listening."

## Content guidelines
- Keep the label to a short present-participle phrase ("Listening…"); avoid restating instructions the user already knows ("Speak now to ask a question").
- The paused label states the state plainly ("Paused"), not an instruction to act ("Tap mic to continue") — pair any needed instruction with a visible affordance instead of relying on the label alone.

## Accessibility
- Wrap the label in \`aria-live="polite"\` so a screen reader announces the active/paused transition without needing focus.
- The stop control must be a real, focusable \`<button>\` with an \`aria-label\` ("Stop listening") since it carries no visible text.
- Respect \`prefers-reduced-motion\`: keep the glyph's color state (it's the actual status signal) but suppress or shorten the expanding ripple.
- Never rely on the ripple animation alone to convey "active" — the accent color and label both carry that meaning independently.

## Related patterns
- Prompt Bar / Prompt Bar Pro — their composer's dictation mic button uses this same single-ring ripple technique at a smaller scale; keep both in sync if the ripple's timing or easing ever changes.
- Voice Waveform — shows the live amplitude of the audio this state confirms is being captured; often shown together, with the waveform inside or beside the mic glyph.
- Live Transcript — shows what capture actually produced once speech is recognized; this state covers the moment before or alongside that text appearing.
`;
