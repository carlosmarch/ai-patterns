"use client";

import * as React from "react";
import { LoaderCircle } from "lucide-react";

import { RejectedPromptComposer, type PromptRejection } from "./component";

const FIRST = "Clean up ~/Downloads and delete anything older than a month, then tidy the landing page copy.";

export default function RejectedPromptRestoreDemo() {
  const [value, setValue] = React.useState(FIRST);
  const [rejection, setRejection] = React.useState<PromptRejection | null>(null);
  const [sending, setSending] = React.useState(false);
  const [started, setStarted] = React.useState<string | null>(null);

  function send(text: string) {
    setSending(true);
    setValue("");
    window.setTimeout(() => {
      setSending(false);
      // The scripted local agent refuses work outside its project folder.
      if (/downloads|~\//i.test(text)) {
        setValue(text);
        setRejection({
          prompt: text,
          reason: "It can only change files inside this project, and ~/Downloads is outside it.",
          suggestion: "Remove that part, or open ~/Downloads as its own project.",
        });
      } else {
        setRejection(null);
        setStarted(text);
      }
    }, 900);
  }

  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      {started ? (
        <div className="flex flex-col gap-2 rounded-2xl border bg-card p-3">
          <p className="text-sm">{started}</p>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <LoaderCircle className="size-3 animate-spin motion-reduce:animate-none" aria-hidden />
            Agent started
          </p>
          <button
            type="button"
            onClick={() => {
              setStarted(null);
              setValue(FIRST);
            }}
            className="self-start text-xs text-muted-foreground underline-offset-2 hover:underline"
          >
            Start over
          </button>
        </div>
      ) : (
        <>
          {sending && (
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <LoaderCircle className="size-3 animate-spin motion-reduce:animate-none" aria-hidden />
              Starting a session…
            </p>
          )}
          <RejectedPromptComposer
            value={value}
            onChange={setValue}
            onSend={send}
            rejection={rejection}
            onDismissRejection={() => setRejection(null)}
            sending={sending}
          />
          {!rejection && !sending && (
            <p className="text-xs text-muted-foreground">Send the prompt — the agent will refuse the first part.</p>
          )}
        </>
      )}
    </div>
  );
}
