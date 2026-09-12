"use client";

import * as React from "react";

import { ChatBubble } from "./component";

const assistantReplies = [
  "For a single reasoning step, the Thinking Loader keeps it simple — a shimmering label with a live elapsed-time counter.",
  "Here's another angle: if there's real structure to show, try the Expandable Trace instead — it collapses into a one-line summary and opens into the full step list.",
];

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

  return (
    <div className="w-full max-w-md space-y-4">
      <ChatBubble role="user" content={userMessage} onEditSubmit={handleEditSubmit} />
      <ChatBubble
        role="assistant"
        content={regenerating ? "Thinking…" : assistantMessage}
        onRegenerate={handleRegenerate}
      />
    </div>
  );
}
