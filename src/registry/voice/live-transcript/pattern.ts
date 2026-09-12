export const pattern = `# Live Transcript

## Summary
A scrolling, speaker-labeled log of a voice conversation's recognized text, updated as speech-to-text results arrive: interim (not-yet-final) text renders lighter with a live cursor and can still be corrected in place, while finalized text settles into normal styling. It's the readable record of what Listening State and Voice Waveform are only signaling is happening.

## When to use
- Any voice conversation where users benefit from a text record of what was said — accessibility for users who can't rely on audio alone, a way to verify the system heard correctly, or a scrollback for a conversation that moved fast.
- Alongside Listening State and/or Voice Waveform, as the content layer under those activity signals — this shows what was captured, they show that capture is happening.
- When speech recognition produces genuinely interim results (a streaming ASR API) that later get corrected — the interim/final distinction is the whole point of this pattern; don't reach for it if your transcription only ever arrives as complete, final utterances.

## When not to use
- For a static, already-complete transcript of a past conversation (e.g. a call summary page) — render that as plain finalized text; the interim styling, live cursor, and auto-scroll are all specifically for a conversation still in progress.
- As the only signal that the mic is live — pair it with Listening State, since a transcript with no new lines yet looks identical to a stalled or disconnected session.
- For multi-party transcription needing more than two speaker roles or precise timestamps — this pattern's two-role (user/assistant) labeling is for a conversational voice agent, not a full meeting-transcription tool.

## Anatomy
- Log region: a scrollable container holding one paragraph per segment, auto-scrolling as new segments arrive.
- Speaker label: a short bold tag ("You", "Assistant") prefixing each segment so turns stay distinguishable without color-only cues.
- Interim segment: lighter, italicized text ending in a blinking cursor — visually marked as provisional and still subject to change.
- Final segment: normal-weight, normal-color text — settled, won't change again.
- Jump-to-latest control: appears only once the user has scrolled up away from the bottom, letting them return to the live edge without fighting the auto-scroll.
- Empty state: a muted "Waiting for speech…" line with a mic glyph, shown before any segment has arrived.

## Behavior
- New words append to the current speaker's interim segment in place — the same segment id gets replaced with updated text, it doesn't append as a new line for every partial result.
- The moment a segment finalizes, its styling settles (cursor removed, italics and muted color drop) and any further speech starts a new segment.
- The transcript auto-scrolls to the newest line only while the user hasn't manually scrolled away; scrolling up disables auto-scroll and reveals the jump-to-latest control, exactly like a running log or terminal stream.
- Never rewrites already-final text based on later context — once a segment is marked final, treat it as committed; corrections apply prospectively to the next segment, not retroactively.

## Content guidelines
- Speaker labels are short and consistent ("You" / "Assistant"), not the person's name or a role description that could vary turn to turn.
- Show interim text exactly as the recognizer produced it, including mid-word states — don't paper over recognition artifacts by delaying display until a cleaner result arrives, that just makes the system look unresponsive.

## Accessibility
- The log region needs \`role="log"\` with \`aria-live="polite"\` while active, so assistive tech announces new finalized content without interrupting — set it to \`aria-live="off"\` once the session ends so historical scrollback isn't re-announced.
- Don't rely on italics/color alone to mark interim text — screen readers won't distinguish it, so consider only announcing segments once they're final, avoiding a flood of in-progress announcements per word.
- The jump-to-latest control must be a real, focusable button; its label states the action ("Jump to latest"), not an icon alone.
- Respect \`prefers-reduced-motion\` for the blinking cursor — a static dash or steady low-opacity mark communicates "still live" without the flash.

## Related patterns
- Listening State — the capture-is-active signal this transcript's content is the output of.
- Voice Waveform — the raw amplitude visualization that pairs with this transcript's recognized text.
- Terminal Stream — the same auto-scroll/jump-to-latest scrolling-log mechanics, applied to command output instead of speech.
- Chat Bubble — once a segment finalizes, hand its text off to a Chat Bubble as the sent message rather than leaving it styled as a transcript segment; the two don't overlap in the same UI element.
`;
