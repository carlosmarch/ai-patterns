import { cn } from "@/lib/utils";

// The "New" tag for the most recently added patterns (see `isNewEntry` in
// the registry). One look everywhere it appears: pattern cards, the pattern
// page header and the home page's "New" block.
export function NewBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-1.5 py-0.5 text-[10px] leading-none font-medium text-blue-600 dark:text-blue-400",
        className,
      )}
    >
      <span aria-hidden className="size-1.5 rounded-full bg-current" />
      New
    </span>
  );
}

const DATE_FORMAT = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });

/** "Nov 7, 2026" — the day a pattern was added, from its `added` timestamp. */
export function formatAdded(added: string) {
  return DATE_FORMAT.format(new Date(added));
}
