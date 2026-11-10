export const pattern = `# Listening State

## Summary
A dedicated visual state — a clickable mic glyph with a halo that swells with the user's voice, and an elapsed timer beneath it — that tells the user the system is actively capturing their voice right now. It's the "your mic is live" moment in a voice interface, distinct from showing what was heard (Live Transcript) or how loud it is (Voice Waveform).

## When to use
- The instant a voice interface starts capturing audio, whether triggered by a push-to-talk press, a wake word, or an always-on mode — show this before or alongside any transcript text appears.
- As the anchor state users glance at to confirm "yes, it's hearing me" separate from reading a waveform or transcript, especially for brief utterances where a transcript hasn't rendered yet.
- Any time capture is paused (muted, held) but the session is still open — use the inactive variant rather than removing the component entirely, so the same glyph stays in place to resume.

## When not to use
- While the assistant is talking, not the user — this state specifically means "capturing your voice." Use a distinct speaking indicator (e.g. Voice Waveform in its \`speaking\` state) for that half of the turn.
- As a permanent idle-mode decoration when no capture session is open — it implies the mic is live; don't show it before the user has actually started or been prompted to speak.
- Stacked with a second, separate ripple/pulse indicator for the same mic state — one active listening indicator per view.

## Anatomy
- Mic glyph: a plain (unfilled) microphone icon, tinted with an accent color while active, amber when no voice is coming through, and muted gray (crossed-out mic) when paused — not a solid-filled badge. The glyph itself is the control: clicking it pauses capture, clicking the crossed-out mic resumes it. There is no separate stop button.
- Voice halo: a soft disc behind the glyph whose size and opacity follow the live mic level, so the user sees their own voice land on the control. Only shown when a real level source is wired up.
- Ripple: a single translucent ring, sized and centered on the glyph itself (not a separate oversized container), that expands outward a short distance and fades to nothing, looping continuously. Because the glyph has no opaque fill behind it, the full ring is visible from the start of each cycle, not just the portion that clears a solid background.
- Elapsed timer: the only visible text — a small tabular counter (\`0:07\`) directly below the glyph. It dims and holds its value while paused.
- Status announcement: a visually hidden live region carrying "Listening…", "Paused" or the silence hint for screen readers. Color and the glyph swap carry the same states visually, so no on-screen label is needed.

## Behavior
- The halo tracks the real mic level every frame with a fast attack and slow release — it jumps with each syllable and settles between words, never flickers.
- After a few seconds of near-silence on a real level source, tint the glyph amber, stop the ambient ripple and announce a plain hint ("Can't hear you — check your mic"), also exposed as the glyph's tooltip — a ripple that keeps pulsing while nothing is heard is a lie. The moment sound returns, go straight back to the accent color and ripple.
- The elapsed timer counts only while capturing: pausing freezes it (dimmed) and resuming continues from the same value, so it always reads as total time captured in this session. Mount a fresh instance for a new session.
- The ripple only animates while \`active\` is true; pausing or muting freezes the glyph in a flat, static state with the ripple removed rather than slowed down, so "paused" is unambiguous at a glance.
- Clicking the glyph toggles capture immediately — no confirmation step, since capture is easy to restart and holding it hostage behind a dialog adds friction to a moment that's meant to feel instant. Give it a hover wash and a slight press-scale so it reads as a button, and keep the hit target the full glyph circle, not just the icon.
- Without an \`onActiveChange\` handler the glyph renders as a plain, non-interactive indicator.
- Nothing shifts when toggling: the glyph cross-fades between mic and crossed-out mic, and the timer stays put.
- On resume, restart the ripple animation from its initial state rather than resuming mid-cycle, so the "just started listening" cue is clear each time.
- Drive the ripple with a plain keyframe \`animate\` (scale \`[1, 1.5]\`, opacity \`[0, 0.6, 0]\`, 1.4s, \`easeOut\`, infinite repeat, no separate \`initial\` or per-instance \`delay\`), with a low-alpha ring color (\`/20\`). Staggering multiple rings via \`delay\` on an infinitely-repeating animation is fragile and prone to drifting out of sync; one ring on a clean loop reads just as clearly as "listening."
- Fade the ripple's opacity in from 0 and back out to 0 within each cycle rather than starting it at full strength — a ring that starts fully visible and simply expands has to hard-reset to a small, bold ring the instant it disappears, which reads as the ring suddenly shrinking rather than continuing to expand. Fading through 0 at both ends of the loop makes the reset invisible.

## Content guidelines
- Keep on-screen text to the timer alone; the glyph, its color and its motion already say "listening", "paused" or "can't hear you".
- Keep the announced label a short present-participle phrase ("Listening…"), and the paused one a plain state ("Paused") rather than an instruction ("Tap mic to continue").
- Phrase the silence hint as a cause plus a fix ("Can't hear you — check your mic").

## Accessibility
- Keep the status in a visually hidden \`aria-live="polite"\` region so a screen reader announces the active/paused/silent transitions without needing focus.
- The glyph must be a real, focusable \`<button>\` with a visible focus ring and an \`aria-label\` that names the action it will take ("Stop listening" / "Resume listening"), since it carries no visible text.
- Respect \`prefers-reduced-motion\`: keep the glyph's color state (it's the actual status signal) but hide the expanding ripple and keep the halo from growing — let its opacity alone carry the voice level.
- Hide the ticking timer from screen readers (\`aria-hidden\`) so it isn't announced every second; the silence hint goes through the same polite live region as the label.
- Never rely on the ripple animation alone to convey "active" — the accent color, the mic/crossed-out-mic glyph and the announced status each carry that meaning independently.

## Related patterns
- **Prompt Bar Pro** — Use it instead inside a composer, where its dictation row is the compact version of this state.
- **Voice Waveform** — Use it as well, inside or beside the mic glyph, to show the live amplitude of what's being captured.
- **Live Transcript** — Use it as well to show the recognized text once speech is understood.
`;
