import { Fragment, type ReactNode } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

export interface Crumb {
  label: string;
  /** Shown in place of the label (which stays as the accessible name). */
  icon?: ReactNode;
  /** Omit for the current page — it renders as plain text with aria-current. */
  href?: string;
}

export function Breadcrumbs({ items, className }: { items: Crumb[]; className?: string }) {
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
        {items.map(({ label, href, icon }, i) => (
          <Fragment key={`${label}-${i}`}>
            {i > 0 && (
              <li role="presentation" aria-hidden="true">
                <ChevronRight className="size-3.5" />
              </li>
            )}
            <li className={cn(!href && "font-medium text-foreground")}>
              {href ? (
                <Link
                  href={href}
                  aria-label={icon ? label : undefined}
                  title={icon ? label : undefined}
                  className={cn(
                    "transition-colors hover:text-foreground",
                    icon && "logo-link flex items-center"
                  )}
                >
                  {icon ?? label}
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
