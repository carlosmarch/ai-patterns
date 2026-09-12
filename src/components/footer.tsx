import Link from "next/link";
import { Origami } from "lucide-react";

import { getCategories, registry } from "@/registry";
import { ThemeToggle } from "@/components/theme-toggle";
import { GithubMark } from "@/components/github-mark";

const REPO_URL = "https://github.com/carlosmarch/ai-patterns";

export function Footer() {
  const categories = getCategories();
  const year = new Date().getFullYear();

  const columns: { heading: string; links: { label: string; href: string; external?: boolean }[] }[] = [
    {
      heading: "Catalogue",
      links: categories.map((category) => ({
        label: category[0].toUpperCase() + category.slice(1),
        href: `/patterns#${category}`,
      })),
    },
    {
      heading: "Resources",
      links: [
        { label: "All patterns", href: "/patterns" },
        { label: "Claude Code skill", href: "/skill" },
        { label: "Source on GitHub", href: REPO_URL, external: true },
        { label: "Report an issue", href: `${REPO_URL}/issues`, external: true },
      ],
    },
    {
      heading: "Built with",
      links: [
        { label: "Next.js", href: "https://nextjs.org", external: true },
        { label: "Tailwind CSS", href: "https://tailwindcss.com", external: true },
        { label: "Motion", href: "https://motion.dev", external: true },
        { label: "Radix UI", href: "https://www.radix-ui.com", external: true },
      ],
    },
  ];

  return (
    <footer className="border-t">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <div className="grid gap-10 sm:grid-cols-[1.2fr_repeat(3,1fr)]">
          <div className="space-y-3">
            <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
              <Origami className="size-5" />
              AI Patterns
            </Link>
            <p className="max-w-[26ch] text-sm text-muted-foreground">
              Production components for AI agent UIs — each with a UX spec the harness can read.
              Guardrails baked in.
            </p>
            <p className="text-xs text-muted-foreground">
              {registry.length} patterns · {categories.length} categories
            </p>
          </div>

          {columns.map((column) => (
            <div key={column.heading} className="space-y-3">
              <p className="text-xs font-medium text-muted-foreground uppercase">{column.heading}</p>
              <ul className="space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    {link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col-reverse items-center justify-between gap-4 border-t pt-6 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            © {year} AI Patterns. MIT licensed. Created by{" "}
            <a
              href="https://carlosmarch.es/"
              target="_blank"
              rel="noreferrer"
              className="underline decoration-dotted underline-offset-2 transition-colors hover:text-foreground"
            >
              👌 Carlos March
            </a>
            .
          </p>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <a
              href={REPO_URL}
              target="_blank"
              rel="noreferrer"
              aria-label="View source on GitHub"
              className="flex size-8 items-center justify-center rounded-full border text-muted-foreground transition-colors hover:text-foreground"
            >
              <GithubMark className="size-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
