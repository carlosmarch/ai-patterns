"use client";

import * as React from "react";
import { Globe, Lock, Share } from "lucide-react";

import { ShareSessionDialog, type ShareVisibility } from "./component";

export default function ShareSessionDemo() {
  const [open, setOpen] = React.useState(false);
  const [visibility, setVisibility] = React.useState<ShareVisibility>("private");

  return (
    <div className="flex w-full max-w-md items-center justify-between gap-3 rounded-2xl border bg-card px-4 py-3">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">Add share dialog to session header</p>
        <p className="flex items-center gap-1 text-xs text-muted-foreground">
          {visibility === "public" ? <Globe className="size-3" aria-hidden /> : <Lock className="size-3" aria-hidden />}
          {visibility === "public" ? "Public" : "Private"}
        </p>
      </div>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-accent"
      >
        <Share className="size-3.5" aria-hidden />
        Share
      </button>

      <ShareSessionDialog
        open={open}
        onOpenChange={setOpen}
        visibility={visibility}
        onVisibilityChange={(next) =>
          new Promise<void>((resolve) =>
            window.setTimeout(() => {
              setVisibility(next);
              resolve();
            }, 500),
          )
        }
        shareUrl="https://example.com/s/7f3a9c2e"
        policyNote={
          <>
            Don&apos;t share personal information or third-party content without permission, and see the{" "}
            <a href="#" className="underline underline-offset-2" onClick={(e) => e.preventDefault()}>
              usage policy
            </a>
            .
          </>
        }
        exposureWarning="This session comes from a private repository. Sharing it can expose the code to anyone with the link."
      />
    </div>
  );
}
