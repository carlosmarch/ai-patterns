"use client";

import * as React from "react";
import { Archive, ArrowUp } from "lucide-react";

import { ArchivedSessionBanner } from "./component";

const TRANSCRIPT = [
  { role: "user", text: "Add a share dialog to the session header." },
  { role: "assistant", text: "Done — the dialog has Private and Public options and warns when the repo is private. Pushed to the branch." },
];

export default function ArchivedSessionDemo() {
  const [archived, setArchived] = React.useState(true);
  const [draft, setDraft] = React.useState("");

  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <div className="flex flex-col gap-2" aria-label="Session transcript">
        {TRANSCRIPT.map((m, i) =>
          m.role === "user" ? (
            <p key={i} className="self-end rounded-2xl bg-muted px-3 py-2 text-sm">
              {m.text}
            </p>
          ) : (
            <p key={i} className="text-sm text-muted-foreground">
              {m.text}
            </p>
          ),
        )}
      </div>

      <ArchivedSessionBanner
        archived={archived}
        detail="Archived after 7 days without activity."
        onUnarchive={() =>
          new Promise<void>((resolve) =>
            window.setTimeout(() => {
              setArchived(false);
              resolve();
            }, 900),
          )
        }
      >
        <div className="flex items-end gap-2 rounded-2xl border bg-card px-3 py-2">
          <textarea
            value={draft}
            rows={2}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Reply…"
            aria-label="Message"
            className="min-w-0 flex-1 resize-none bg-transparent py-1 text-sm outline-none placeholder:text-muted-foreground"
          />
          <button
            type="button"
            disabled={!draft.trim()}
            onClick={() => setDraft("")}
            className="flex size-8 shrink-0 items-center justify-center rounded-full bg-foreground text-background transition-opacity disabled:opacity-40"
          >
            <ArrowUp className="size-4" aria-hidden />
            <span className="sr-only">Send</span>
          </button>
        </div>
      </ArchivedSessionBanner>

      {!archived && (
        <button
          type="button"
          onClick={() => setArchived(true)}
          className="inline-flex items-center gap-1.5 self-start text-xs text-muted-foreground underline-offset-2 hover:underline"
        >
          <Archive className="size-3" aria-hidden />
          Archive again
        </button>
      )}
    </div>
  );
}
