"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { SiteCommandPalette } from "@/components/site-command-palette";

const links = [
  { href: "/patterns", label: "Patterns" },
  { href: "/skill", label: "Skill" },
];

export function SiteNav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-2">
      {links.map(({ href, label }) => {
        const isActive = pathname === href || pathname.startsWith(`${href}/`);

        return (
          <Link
            key={href}
            href={href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "rounded-md bg-background px-2.5 py-1.5 text-sm transition-colors hover:text-foreground",
              isActive ? "font-medium text-foreground" : "text-muted-foreground",
              href === "/patterns" && "hidden sm:inline-block"
            )}
          >
            {label}
          </Link>
        );
      })}
      <SiteCommandPalette />
    </nav>
  );
}
