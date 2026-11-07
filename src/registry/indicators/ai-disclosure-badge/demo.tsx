"use client";

import * as React from "react";

import { AiDisclosureBadge } from "./component";

export default function AiDisclosureBadgeDemo() {
  const [edited, setEdited] = React.useState(false);

  const details = {
    model: "Atlas",
    generatedAt: "Today, 14:02",
    editedBy: edited ? "Maya Chen" : undefined,
    note: "May contain mistakes. Check important facts.",
  };

  return (
    <div className="flex w-full max-w-lg flex-col gap-4 pb-28">
      <div className="flex gap-2">
        {[false, true].map((value) => (
          <button
            key={String(value)}
            type="button"
            onClick={() => setEdited(value)}
            className={[
              "rounded-full px-3 py-1 text-xs font-medium transition-colors",
              edited === value ? "bg-foreground text-background" : "bg-muted text-muted-foreground hover:text-foreground",
            ].join(" ")}
          >
            {value ? "Edited by a person" : "Unedited"}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <figure className="relative h-32 shrink-0 overflow-visible rounded-2xl bg-gradient-to-br from-muted to-muted-foreground/30 sm:w-44">
          <AiDisclosureBadge variant="overlay" details={details} className="absolute top-2 left-2" />
        </figure>

        <article className="flex min-w-0 flex-1 flex-col gap-2 rounded-2xl border bg-card p-4">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold">Q3 product summary</h3>
            <AiDisclosureBadge details={details} />
          </div>
          <p className="text-sm text-pretty text-muted-foreground">
            Revenue grew 18% quarter over quarter, led by the new team plan. Churn held steady at 2.1%.
          </p>
          <AiDisclosureBadge variant="inline" details={details} className="self-start" />
        </article>
      </div>
    </div>
  );
}
