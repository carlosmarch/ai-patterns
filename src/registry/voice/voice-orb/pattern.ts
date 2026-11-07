export const pattern = `# Voice Orb

## Summary
A slowly rotating 3D sphere of particles that stands in for the assistant during a voice conversation. It swells, ripples and spins with the live audio level, and changes its motion by turn — listening, thinking, speaking — so the whole screen reads as "a presence you're talking to" rather than a form you're filling in.

## When to use
- As the hero of a full-screen or panel-sized voice mode, where there's no text to read and the user needs one calm focal point that shows the conversation is alive.
- When the interface has to communicate turn-taking at a glance: the orb's motion changes between the user's turn (listening), the gap (thinking) and the assistant's turn (speaking).
- When brand presence matters in a voice product — the orb is the assistant's "face", and its tint and density can carry the brand.

## When not to use
- In a compact composer or a toolbar — the orb needs room to read as 3D. Use Voice Waveform or Listening State there instead.
- When the user needs to monitor exact mic levels (dictation, recording, audio setup) — a waveform or meter is more legible than a breathing sphere.
- On low-power or text-first screens where a continuously animating canvas costs battery for little information.

## Anatomy
- Sphere: several hundred particles spread evenly over a sphere's surface (golden-angle spiral), lightly varied in size so it reads as dust, not a grid.
- Depth cue: particles on the near side are larger and brighter; those on the far side shrink and fade, which is what makes a flat canvas read as a ball.
- Surface ripple: a slow travelling wave displaces each particle along its radius; its amplitude grows with the voice level.
- Tint: one color (\`currentColor\`) that follows the theme — dark particles on a light surface, warm white on a dark one — and updates live when the theme changes. No gradients or per-state hues — state is carried by motion.

## Behavior
- \`idle\`: the sphere sits at rest size and turns very slowly, with almost no ripple — present but quiet.
- \`listening\`: reacts to the user's mic level — it swells and ripples with each syllable.
- \`thinking\`: the level is ignored and the sphere twists like a Rubik's cube — one third of it (a slice along x, y or z) turns 90° with an ease-in-out, pauses briefly, then another slice turns. The mechanical, step-by-step motion reads as "working on it" and is clearly different from the organic breathing of listening and speaking. A turn in progress always finishes before the orb leaves this state, so it never stops half-twisted.
- \`speaking\`: reacts to the assistant's outgoing audio with the largest swell and ripple, so the assistant's turn feels more energetic than the user's.
- The level is smoothed with a fast attack and slow release: the orb jumps with a syllable and settles gently instead of jittering.
- Sample the level from a real source (an \`AnalyserNode\` on the mic or the playback element) and pass it as a ref, so the canvas reads it every frame without re-rendering the tree. Without a level, the orb runs a synthetic rhythm for prototypes — never mix the two.
- State changes don't cut: rotation and swell carry over, so moving between turns feels continuous.

## Content guidelines
- The orb carries no text. Pair it with a short state caption ("Listening…", "Thinking…") or a Live Transcript when the user needs words.
- Keep a visible, labeled control (mute, end call) near the orb — it's not a button itself.

## Accessibility
- The canvas has \`role="img"\` and an \`aria-label\` naming the current state ("Listening", "Speaking"). Announce turn changes through a separate polite live region, not by relabeling the canvas alone.
- Respect \`prefers-reduced-motion\`: stop the rotation, ripple and slice turns, and let only the size change gently with the level.
- Don't rely on the orb alone to signal turn-taking — pair it with a text state or a speaker label.
- Keep contrast between the particles and the backdrop high enough that the sphere's outline is visible at rest.

## Related patterns
- **Voice Waveform** — Use it instead where the orb doesn't fit and a compact, literal level display is enough.
- **Listening State** — Use it instead in a composer, where a pill-sized mic-is-on indicator fits better.
- **Live Transcript** — Use it as well below or beside the orb to show what's being said.
- **Thinking Loader** — Use it instead in a text-only interface for the orb's thinking state.
`;
