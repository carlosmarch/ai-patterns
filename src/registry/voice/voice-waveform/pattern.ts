export const pattern = `# Voice Waveform

## Summary
A row of amplitude bars that visualizes live audio while a voice conversation is active — either the user's mic input while the system listens, or the system's own audio while it speaks. The bar heights track real signal energy, so the shape is never decorative alone: it's the one piece of the UI that proves audio is actually flowing.

## When to use
- Anywhere audio is actively being captured or played back in a voice interface (a voice mode, a call-style assistant, a dictation composer) and the user benefits from seeing that the mic or speaker is live.
- Paired with Listening State as the "is it working" confirmation once capture has actually started — Listening State signals the mode, this component proves signal is coming through.
- As the visual body of a "speaking" indicator while an assistant's audio response plays, so users can see when it finishes talking without relying on audio alone.

## When not to use
- As a fake "always animating" decoration with no real amplitude behind it — an idle shimmer belongs to a loader pattern (see Thinking Loader), not this one. If there's no live level to show, use the \`idle\` state's flat bars, don't fabricate motion.
- For a static, already-recorded audio clip's waveform (e.g. a voice message you can scrub) — that's a seek/scrubber component with a fixed waveform image, a different pattern than this live, continuously-updating one.
- When there is no audio at all in the interaction — this is specifically for voice, not a generic "activity" indicator.

## Anatomy
- Bars: a fixed-count row of thin, rounded-cap bars, evenly spaced, vertically centered so taller bars grow symmetrically up and down from the middle.
- Color by state: idle bars sit low and muted; listening bars pick up an accent color (distinct from the assistant's own color) so users can tell "you're being heard" apart from "it's replying"; speaking bars use the foreground/brand color.

## Behavior
- Bar heights update on every amplitude sample from the real audio source (an \`AnalyserNode\`, a WebRTC audio track, or the transport's own level events) — each bar eases to its new height rather than snapping, so the row reads as a continuous waveform instead of a flicker.
- \`idle\`: bars sit at a minimum flat height with no motion — audio isn't flowing.
- \`listening\`: bars react to the user's mic input in real time.
- \`speaking\`: bars react to the assistant's outgoing audio in real time.
- The moment audio stops (silence, mic muted, playback ends), bars settle back toward the idle floor rather than freezing mid-peak.
- Never mix live sampled levels with synthetic randomness in the same instance — a prototype without real audio wired up yet should look plausibly alive, but once a real level source exists, use it exclusively.

## Content guidelines
- N/A — this pattern carries no text content itself; pair it with a label (see Listening State) when the mode itself needs to be named.

## Accessibility
- Give the container an accessible name via \`role="img"\` and \`aria-label\` stating the current state in words ("Listening", "Speaking", "Voice input idle") — the bars themselves are purely visual and carry no independent semantic content.
- Respect \`prefers-reduced-motion\`: replace the rapid per-sample bar animation with a gentle static or slow-moving pattern that still communicates "audio is active" without the flicker.
- Don't rely on the waveform alone to signal turn-taking (who's talking) — pair it with a persistent state label or speaker indicator for screen reader users and anyone not watching closely.

## Related patterns
- Listening State — the broader "the system is capturing your voice" indicator this waveform's \`listening\` state visualizes the input for.
- Live Transcript — shows what the captured audio actually contained, once transcribed; use alongside this component so users get both the raw signal and the recognized text.
`;
