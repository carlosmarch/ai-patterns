"use client";

import * as React from "react";

import { ChatBubble } from "./component";

const assistantReplies = [
  "Pistachio is trending — I'd lean into a pistachio-apricot swirl for the summer menu.",
  "Here's another angle: pair pistachio with a stone-fruit sorbet for a lighter option.",
];

export default function ChatBubbleDemo() {
  const [userMessage, setUserMessage] = React.useState("What flavor should we launch next?");
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
