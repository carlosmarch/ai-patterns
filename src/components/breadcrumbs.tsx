import { Fragment } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

export interface Crumb {
  label: string;
  /** Omit for the current page — it renders as plain text with aria-current. */
  href?: string;
}

export function Breadcrumbs({ items, className }: { items: Crumb[]; className?: string }) {
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
        {items.map(({ label, href }, i) => (
          <Fragment key={`${label}-${i}`}>
            {i > 0 && (
              <li role="presentation" aria-hidden="true">
                <ChevronRight className="size-3.5" />
              </li>
            )}
            <li className={cn(!href && "font-medium text-foreground")}>
              {href ? (
                <Link href={href} className="transition-colors hover:text-foreground">
                  {label}
                </Link>
              ) : (
                <span aria-current="page">{label}</span>
              )}
            </li>
          </Fragment>
        ))}
      </ol>
    </nav>
  );
}
