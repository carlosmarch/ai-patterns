"use client";

import * as React from "react";

import { ConversationBranches, type Branch } from "./component";

const initial: Branch[] = [
  {
    id: "1",
    prompt: "Suggest a name for my bakery",
    response: "How about “Rise & Shine”? It's warm, easy to remember and hints at fresh morning bread.",
  },
];

// Canned replies standing in for a model call.
function replyFor(prompt: string) {
  if (/french|paris/i.test(prompt)) return "Try “Le Petit Four” — classic, a little playful, and clearly French.";
  if (/short|one word/i.test(prompt)) return "“Crumb.” Short, friendly and it works as a logo on its own.";
  return `Here's one for “${prompt}”: “The Daily Loaf” — simple, dependable and easy to say.`;
}

export default function ConversationBranchesDemo() {
  const [branches, setBranches] = React.useState(initial);
  const [active, setActive] = React.useState(0);

  function edit(prompt: string) {
    const id = String(Date.now());
    setBranches((b) => [...b, { id, prompt }]);
    setActive(branches.length);
    setTimeout(() => {
      setBranches((b) => b.map((x) => (x.id === id ? { ...x, response: replyFor(prompt) } : x)));
    }, 1200);
  }

  return (
    <div className="flex w-full max-w-lg flex-col gap-4">
      <p className="text-xs text-muted-foreground">
        Hover the message and edit it — try “Suggest a short French name for my bakery”.
      </p>
      <ConversationBranches branches={branches} active={active} onActiveChange={setActive} onEdit={edit} />
    </div>
  );
}
