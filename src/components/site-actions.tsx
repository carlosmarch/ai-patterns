"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowUpRight, ChevronDown, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";
import { trackMcpInstallClicked } from "@/lib/analytics";
import { CURSOR_INSTALL_URL, VSCODE_INSTALL_URL } from "@/lib/mcp-install";
import { GithubMark } from "@/components/github-mark";
import { BorderBeam } from "@/registry/effects/border-beam/component";

const REPO_URL = "https://github.com/carlosmarch/ai-patterns";

const menuItems = [
  { label: "Add MCP to Cursor", href: CURSOR_INSTALL_URL, client: "cursor" },
  { label: "Add MCP to VS Code", href: VSCODE_INSTALL_URL, client: "vscode" },
  { label: "llms.txt", href: "/llms.txt" },
  { label: "Star on GitHub", href: REPO_URL, external: true },
];

/**
 * Right side of the header: a round GitHub button and a split CTA — the main
 * half goes to the skill, the chevron opens the other ways to install.
 */
export function SiteActions() {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div className="flex items-center gap-2">
      <a
        href={REPO_URL}
        target="_blank"
        rel="noreferrer"
        aria-label="AI Patterns on GitHub"
        className="hidden size-9 items-center justify-center rounded-full border bg-background text-foreground sm:flex transition-colors hover:bg-muted"
      >
        <GithubMark className="size-4" />
      </a>

      <div ref={ref} className="relative hidden sm:block">
        <BorderBeam radius={9999} duration={8} active className="p-[1.5px]">
          <div className="flex h-9 items-stretch overflow-hidden rounded-full bg-foreground text-background">
            <Link
              href="/skill"
              className="flex items-center gap-1.5 pr-3.5 pl-3.5 text-sm font-medium transition-opacity hover:opacity-80"
            >
              <Sparkles className="size-4" aria-hidden />
              Get the skill
            </Link>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-label="More ways to install"
              aria-haspopup="menu"
              aria-expanded={open}
              className="flex items-center border-l border-background/20 pr-3 pl-2.5 transition-opacity hover:opacity-80"
            >
              <ChevronDown
                className={cn(
                  "size-4 transition-transform",
                  open && "rotate-180",
                )}
                aria-hidden
              />
            </button>
          </div>
        </BorderBeam>

        {open && (
          <div
            role="menu"
            className="absolute top-full right-0 mt-2 w-52 rounded-xl border bg-background p-1"
          >
            {menuItems.map((item) => (
              <a
                key={item.label}
                role="menuitem"
                href={item.href}
                {...(item.external
                  ? { target: "_blank", rel: "noreferrer" }
                  : {})}
                onClick={() => {
                  if (item.client)
                    trackMcpInstallClicked({
                      client: item.client,
                      page: "header",
                    });
                  setOpen(false);
                }}
                className="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {item.label}
                <ArrowUpRight className="size-3.5" aria-hidden />
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
