import Link from "next/link";
import { Origami } from "lucide-react";

import { getCategories, registry } from "@/registry";
import { ThemeToggle } from "@/components/theme-toggle";

const REPO_URL = "https://github.com/carlosmarch/ai-patterns";

// lucide-react no longer ships brand/logo icons, so the GitHub mark is inlined here.
function GithubMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.09 3.29 9.4 7.86 10.93.58.1.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.7-3.88-1.54-3.88-1.54-.52-1.33-1.28-1.69-1.28-1.69-1.04-.72.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.75 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.55-.29-5.23-1.28-5.23-5.68 0-1.25.44-2.28 1.18-3.08-.12-.29-.51-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.78 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.24 2.76.12 3.05.74.8 1.18 1.83 1.18 3.08 0 4.41-2.69 5.38-5.25 5.67.41.36.78 1.06.78 2.14 0 1.55-.01 2.79-.01 3.17 0 .31.21.67.8.56A10.52 10.52 0 0 0 23.5 12c0-6.35-5.15-11.5-11.5-11.5Z" />
    </svg>
  );
}

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
              Carlos March
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
