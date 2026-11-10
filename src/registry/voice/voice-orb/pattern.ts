export const pattern = `# Voice Orb

## Summary
A slowly rotating 3D sphere of particles that stands in for a voice agent during a call. It carries the agent through four states — Ready, Listening, Thinking and Speaking — swelling, rippling and spinning with the live audio level, with the state named above it, the live transcript streaming under it and a call pill (mute, timer, end call) at the bottom. The whole screen reads as "a presence you're talking to" rather than a form you're filling in.

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
- State word: one muted word above the orb — Ready, Listening, Thinking, Speaking (or Muted, Call ended) — crossfading on each change.
- Live transcript: the current turn's words, centered under the orb in a fixed-height area of about three lines. New words blur in; the last few stay at full strength and older ones fade to muted, and the top edge feathers out as the line grows, so the eye always lands on what was just said.
- Call pill: a bordered pill with a mute toggle, the elapsed call time (\`m:ss\`, tabular figures) and a red-tinted end-call button. After the call ends it's replaced by a single "Call again" button.
- Tint: one color (\`currentColor\`) that follows the theme — dark particles on a light surface, warm white on a dark one — and updates live when the theme changes. No gradients or per-state hues — state is carried by motion.

## Behavior
- \`ready\`: the sphere sits at rest size and turns very slowly, with almost no ripple — connected, present and waiting for the user to speak. This is also where the orb rests between turns.
- \`listening\`: reacts to the user's mic level — it swells and ripples with each syllable.
- \`thinking\`: the level is ignored and the sphere twists like a Rubik's cube — one third of it (a slice along x, y or z) turns 90° with an ease-in-out, pauses briefly, then another slice turns. The mechanical, step-by-step motion reads as "working on it" and is clearly different from the organic breathing of listening and speaking. A turn in progress always finishes before the orb leaves this state, so it never stops half-twisted.
- \`speaking\`: reacts to the assistant's outgoing audio with the largest swell and ripple, so the assistant's turn feels more energetic than the user's.
- The level is smoothed with a fast attack and slow release: the orb jumps with a syllable and settles gently instead of jittering.
- Sample the level from a real source (an \`AnalyserNode\` on the mic or the playback element) and pass it as a ref, so the canvas reads it every frame without re-rendering the tree. Without a level, the orb runs a synthetic rhythm for prototypes — never mix the two.
- Muting holds the orb in \`ready\` and swaps the state word for "Muted", whatever the agent is doing; unmuting picks up where it left off.
- The timer starts at 0:00 when the call connects, ticks once a second, holds its last value when the call ends and restarts on the next call.
- Ending the call dims the orb, fades the whole transcript to muted and leaves the last line in place, so the user can see where the conversation stopped.
- State changes don't cut: rotation and swell carry over, so moving between turns feels continuous.

## Content guidelines
- The orb itself carries no text; the state word above it does. Keep it to one word per state — "Ready", "Listening", "Thinking", "Speaking" — no ellipses or full sentences.
- Show only the current turn in the transcript, not the history — the orb screen is for the live moment; offer a Live Transcript elsewhere for the full record.
- Show the user's words as recognized, without correcting them, so misheard words are visible and can be repeated.
- Keep the call controls visible and labeled for assistive tech (mute, end call) — the orb is not a button itself.

## Accessibility
- The canvas has \`role="img"\` and an \`aria-label\` naming the current state ("Listening", "Speaking"). Announce turn changes through a separate polite live region, not by relabeling the canvas alone.
- Announce each finished transcript line once ("You: …", "Assistant: …") in its own polite live region; never announce the streaming partials word by word.
- The mute button is a toggle (\`aria-pressed\`) with a label that names its action; the end-call button has an explicit "End call" label since it's icon-only.
- Respect \`prefers-reduced-motion\`: stop the rotation, ripple and slice turns, and let only the size change gently with the level.
- Don't rely on the orb alone to signal turn-taking — pair it with a text state or a speaker label.
- Keep contrast between the particles and the backdrop high enough that the sphere's outline is visible at rest.

## Related patterns
- **Voice Waveform** — Use it instead where the orb doesn't fit and a compact, literal level display is enough.
- **Listening State** — Use it instead in a composer, where a pill-sized mic-is-on indicator fits better.
- **Live Transcript** — Use it as well below or beside the orb to show what's being said.
- **Thinking Loader** — Use it instead in a text-only interface for the orb's thinking state.
`;
