"use client";

import * as React from "react";
import { Mic } from "lucide-react";

import { ChatBubble } from "./component";
import { LiveTranscript, type TranscriptSegment } from "../../voice/live-transcript/component";

const assistantReplies = [
  "For a single reasoning step, the Thinking Loader keeps it simple — a shimmering label with a live elapsed-time counter.",
  "Here's another angle: if there's real structure to show, try the Expandable Trace instead — it collapses into a one-line summary and opens into the full step list.",
];

const VOICE_MESSAGE = "How should a voice message show up while I'm still talking?";
const VOICE_REPLY =
  "Show it as a Live Transcript while you're speaking, then hand the finalized text off to a Chat Bubble once you stop.";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default function ChatBubbleDemo() {
  const [userMessage, setUserMessage] = React.useState("Which loader should I use while my agent is thinking?");
  const [assistantMessage, setAssistantMessage] = React.useState(assistantReplies[0]);
  const [regenerating, setRegenerating] = React.useState(false);
  const replyIndex = React.useRef(0);

  function handleRegenerate() {
    setRegenerating(true);
    window.setTimeout(() => {
      replyIndex.current = (replyIndex.current + 1) % assistantReplies.length;
      setAssistantMessage(assistantReplies[replyIndex.current]);
      setRegenerating(false);
    }, 700);
  }

  function handleEditSubmit(next: string) {
    setUserMessage(next);
    handleRegenerate();
  }

  const [voicePhase, setVoicePhase] = React.useState<"idle" | "recording" | "sent">("idle");
  const [voiceSegment, setVoiceSegment] = React.useState<TranscriptSegment | null>(null);

  async function startVoiceMessage() {
    setVoicePhase("recording");
    setVoiceSegment(null);

    const words = VOICE_MESSAGE.split(" ");
    for (let i = 1; i <= words.length; i++) {
      setVoiceSegment({ id: "voice-message", speaker: "user", text: words.slice(0, i).join(" "), final: false });
      await sleep(90);
    }

    setVoiceSegment((prev) => (prev ? { ...prev, final: true } : prev));
    await sleep(500);
    setVoicePhase("sent");
  }

  return (
    <div className="w-full max-w-md space-y-8">
      <div className="space-y-4">
        <ChatBubble role="user" content={userMessage} onEditSubmit={handleEditSubmit} />
        <ChatBubble
          role="assistant"
          content={regenerating ? "Thinking…" : assistantMessage}
          onRegenerate={handleRegenerate}
        />
      </div>

      <div className="space-y-3 border-t pt-6">
        <p className="text-xs text-muted-foreground">Voice input: a Live Transcript hands off into a Chat Bubble</p>

        {voicePhase === "idle" && (
          <button
            type="button"
            onClick={startVoiceMessage}
            className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-accent"
          >
            <Mic className="size-3.5" />
            Start voice message
          </button>
        )}

        {voicePhase === "recording" && voiceSegment && <LiveTranscript segments={[voiceSegment]} />}

        {voicePhase === "sent" && (
          <div className="space-y-4">
            <ChatBubble role="user" content={VOICE_MESSAGE} />
            <ChatBubble role="assistant" content={VOICE_REPLY} />
          </div>
        )}
      </div>
    </div>
  );
}
