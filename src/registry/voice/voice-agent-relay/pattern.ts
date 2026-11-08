export const pattern = `# Voice Agent Relay

## Summary
A realtime voice call with a front-line voice agent that hands work to a separate working agent and keeps the person posted while it runs. The person describes a change out loud, can ask what the agent is doing at any point, and hears short progress notes and a spoken summary at the end — without reading the full written output. A run strip shows the working agent's status, and the transcript marks hand-offs, progress notes and the summary apart from conversation.

## When to use
- A working agent runs tasks that take minutes, and people want to delegate and follow them hands-free or away from the screen (walking, cooking, on a phone).
- The product already has an agent that edits code, documents or projects; voice is a way in, not a separate assistant.
- People want to ask "how's it going?" or "what changed?" without opening the run's trace or diff.

## When not to use
- The voice conversation is the work itself (a voice assistant answering questions). Use **Voice Orb** or **Listening State** for that.
- Speech is only an input method. Dictation that turns speech into text in the composer is simpler and keeps the person in control of what is sent.
- Runs that need careful review before anything is applied. Speak the summary, but route approvals to the screen — don't ask people to approve diffs by ear.
- Shared or noisy spaces where speaking or playback is impractical; always keep the text chat as an equal path.

## Anatomy
- Start voice chat: the composer's Send slot becomes a waveform button when the agent is idle and the input is empty, so starting a call costs no extra space.
- Run strip: the working agent's task title, its current step in a few words, and a status (Agent working / Done).
- Transcript: the last few lines of the call — what the person said, what the voice agent said back, and three marked kinds of relay lines: **Handed to agent** (the request as passed on), progress notes, and the **Summary**.
- Call bar: who is talking (Listening / Speaking / Muted), elapsed time, a live waveform, Mute and End.
- Outside the app: the same mute and end controls on the lock screen or system call UI, where the platform allows.

## Behavior
- The voice agent restates the request before handing it off ("Got it — I'll ask the agent to…"), so a misheard instruction is caught before work starts. The hand-off line shows the exact request passed on.
- The person can keep talking while the working agent runs. Questions about progress are answered from the run's live state, not guessed.
- New requests mid-run are added to the run as further hand-offs; they don't start a parallel run unless the person asks.
- Progress notes are short and sparse — one when the work moves to something new, not one per tool call.
- When the run ends, the voice agent speaks a brief summary (what changed, how many files, anything that needs a look) and points to where the full reply and diff are. The written reply still lands in the chat.
- Mute stops listening but leaves the call and the run going. End stops the call only — it never cancels the working agent's run.
- If the working agent needs approval or hits an error, say so out loud and show it on screen; don't wait for the person to ask.

## Content guidelines
- Spoken lines are one or two short sentences. Lead with the outcome: "Done. Three files changed…", not "So I've been looking into…".
- Hand-off lines are imperative and specific, as the working agent received them: "Add a Monthly / Annual toggle to pricing, annual at 20% off".
- Progress notes name the thing, not the tool: "It's editing pricing.tsx", not "Running apply_patch".
- Say numbers and file names plainly; leave paths, code and diffs to the screen.

## Accessibility
- The start button, Mute and End are real buttons with accessible names; Mute uses \`aria-pressed\`.
- What the voice agent says is mirrored as text and announced through a polite live region, so the call works with a screen reader and for people who can't hear the audio. The person's own transcript isn't announced back to them.
- Relay lines carry text labels ("Handed to agent", "Progress", "Summary"), not only icons.
- Never make voice the only way to do something — every request and every result is also available in the text chat.
- The waveform is decorative; call state is given in text. Under \`prefers-reduced-motion\`, new lines fade in without sliding.

## Related patterns
- **Voice Orb** — Use it instead when the voice conversation is the work, not a channel to another agent.
- **Listening State** — Use it for the moment of capture when voice only fills the composer.
- **Background Tasks Drawer** — Use it as well to show the same run on screen, with stop controls.
- **Diff Summary Card** — Use it as well for the written result the spoken summary points to.
`;
