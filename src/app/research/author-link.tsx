"use client";

import type { ReactNode } from "react";

import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { AUTHOR } from "@/lib/research";

// The author's name, linking to their site, with a preview of the site on hover.
export function AuthorLink({ className, children }: { className?: string; children?: ReactNode }) {
  const host = new URL(AUTHOR.url).host;
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <a href={AUTHOR.url} target="_blank" rel="noreferrer" className={className ?? "transition-colors hover:text-foreground"}>
          {children ?? AUTHOR.name}
        </a>
      </HoverCardTrigger>
      <HoverCardContent>
        <p className="text-sm font-medium text-foreground">{AUTHOR.siteTitle}</p>
        <p className="mt-1.5 text-sm leading-relaxed font-normal text-muted-foreground">{AUTHOR.siteDescription}</p>
        <p className="mt-3 font-mono text-[11px] font-normal text-muted-foreground">{host}</p>
      </HoverCardContent>
    </HoverCard>
  );
}
