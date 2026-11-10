import { Check, X } from "lucide-react";
import type { ReactNode } from "react";

import { getSpecList, type RegistryEntry } from "@/registry";

// "Do's and don'ts" on a pattern page, drawn from the spec's "When to use"
// and "When not to use" sections so the page and the spec never drift apart.
// Also shown in the expanded view's Context tab, with its own heading id
// (the page's copy is on the same page). The columns follow the section's own
// width (container query), not the window's: two side by side when there's
// room, stacked when not — on the page and in the resizable panel alike.
export function DosAndDonts({
  entry,
  headingId = "dos-and-donts",
}: {
  entry: RegistryEntry;
  headingId?: string;
}) {

  const dos = getSpecList(entry, "When to use");
  const donts = getSpecList(entry, "When not to use");
  if (dos.length === 0 && donts.length === 0) return null;

  return (
    <section aria-labelledby={headingId} className="@container mt-12">
      <h2 id={headingId} className="mb-4 text-lg font-semibold tracking-tight">
        Do&rsquo;s and don&rsquo;ts
      </h2>
      <div className="grid gap-3 @xl:grid-cols-2">
        <Column kind="do" items={dos} />
        <Column kind="dont" items={donts} />
      </div>
    </section>
  );
}

function Column({ kind, items }: { kind: "do" | "dont"; items: string[] }) {
  if (items.length === 0) return null;
  const isDo = kind === "do";
  const Icon = isDo ? Check : X;

  return (
    <div className="rounded-xl border bg-muted/40 p-4">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-medium">
        <span
          className={
            "flex size-5 items-center justify-center rounded-full " +
            (isDo
              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
              : "bg-red-500/15 text-red-600 dark:text-red-400")
          }
          aria-hidden
        >
          <Icon className="size-3.5" strokeWidth={2.5} />
        </span>
        {isDo ? "Do use it for" : "Don’t use it for"}
      </h3>
      <ul className="space-y-2.5">
        {items.map((item) => (
          <li key={item} className="flex gap-2 text-sm text-muted-foreground">
            <Icon
              className={"mt-0.5 size-3.5 shrink-0 " + (isDo ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400")}
              aria-hidden
            />
            <span>{renderInline(item)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Just the inline markdown the specs use: **bold** and `code`.
function renderInline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-medium text-foreground">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={i} className="rounded bg-muted px-1 py-0.5 font-mono text-[0.8em] text-foreground">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}
