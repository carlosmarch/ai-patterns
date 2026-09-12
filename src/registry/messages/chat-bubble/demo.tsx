"use client";

import * as React from "react";

import { ChatBubble } from "./component";

interface Turn {
  user: string;
  assistant: string;
}

const assistantReplies = [
  "For a single reasoning step, the Thinking Loader keeps it simple — a shimmering label with a live elapsed-time counter.",
  "Here's another angle: if there's real structure to show, try the Expandable Trace instead — it collapses into a one-line summary and opens into the full step list.",
];

const initialTurn: Turn = {
  user: "Which loader should I use while my agent is thinking?",
  assistant: assistantReplies[0],
};

export default function ChatBubbleDemo() {
  const [turns, setTurns] = React.useState<Turn[]>([initialTurn]);
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [regenerating, setRegenerating] = React.useState(false);
  const replyIndex = React.useRef(0);

  function nextReply() {
    replyIndex.current = (replyIndex.current + 1) % assistantReplies.length;
    return assistantReplies[replyIndex.current];
  }

  function addTurn(user: string) {
    setRegenerating(true);
    window.setTimeout(() => {
      setTurns((prev) => {
        const next = [...prev.slice(0, activeIndex + 1), { user, assistant: nextReply() }];
        setActiveIndex(next.length - 1);
        return next;
      });
      setRegenerating(false);
    }, 700);
  }

  const activeTurn = turns[activeIndex];

  return (
    <div className="w-full max-w-md space-y-4">
      <ChatBubble
        role="user"
        content={activeTurn.user}
        onEditSubmit={addTurn}
        onRegenerate={() => addTurn(activeTurn.user)}
        versionIndex={activeIndex}
        versionCount={turns.length}
        onVersionChange={setActiveIndex}
      />
      <ChatBubble
        role="assistant"
        content={regenerating ? "Thinking…" : activeTurn.assistant}
        onRegenerate={() => addTurn(activeTurn.user)}
        versionIndex={activeIndex}
        versionCount={turns.length}
        onVersionChange={setActiveIndex}
      />
    </div>
  );
}
