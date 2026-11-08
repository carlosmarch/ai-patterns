import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";

import type { RegistryEntry } from "@/registry";
import { SeenIn } from "@/components/seen-in";
import type { SeenIn as SeenInRef } from "@/lib/teams";

// Layout pieces for the home page: section headers and the live demo card.

export const href = (entry: RegistryEntry) => `/patterns/${entry.category}/${entry.slug}`;

export function Section({
  id,
  title,
  blurb,
  meta,
  action,
  children,
}: {
  id?: string;
  title: string;
  blurb?: string;
  meta?: string;
  action?: { label: string; href: string };
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-16 py-10 sm:py-12">
      <div className="mb-4 flex items-baseline justify-between gap-4">
        <div>
          <h2 className="text-sm font-medium">{title}</h2>
          {blurb && <p className="mt-0.5 text-xs text-muted-foreground">{blurb}</p>}
        </div>
        {action ? (
          <Link
            href={action.href}
            className="shrink-0 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            {action.label} →
          </Link>
        ) : (
          meta && <span className="shrink-0 font-mono text-[11px] text-muted-foreground">{meta}</span>
        )}
      </div>
      {children}
    </section>
  );
}

export function Card({
  title,
  description,
  href,
  seenIn,
  className,
  children,
}: {
  title: string;
  description: string;
  href: string;
  seenIn?: SeenInRef[];
  className?: string;
  children: ReactNode;
}) {
  return (
    <article className={"rounded-xl border bg-muted/40 p-1.5 " + (className ?? "")}>
      <div className="overflow-hidden rounded-lg border bg-card dark:bg-background">{children}</div>
      <div className="flex items-end justify-between gap-4 px-3 pt-3 pb-2">
        <div className="min-w-0">
          <h3 className="text-sm font-medium">{title}</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <SeenIn items={seenIn} size="sm" linked className="hidden sm:flex" />
          <Link
            href={href}
            aria-label={`View ${title} details`}
            className="flex size-7 shrink-0 items-center justify-center rounded-full border bg-background text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowUpRight className="size-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}
