import Link from "next/link";
import { Heart, Sparkles } from "lucide-react";

import { AnimatedOrigami } from "@/components/animated-origami";
import { ThemeToggle } from "@/components/theme-toggle";
import { GithubMark } from "@/components/github-mark";

const REPO_URL = "https://github.com/carlosmarch/ai-patterns";

type FooterLink = { label: string; href: string; external?: boolean };

const columns: { heading: string; links: FooterLink[] }[] = [
  {
    heading: "Product",
    links: [
      { label: "Patterns", href: "/patterns" },
      { label: "Skill", href: "/skill" },
    ],
  },
  {
    heading: "Resources",
    links: [
      { label: "Research thesis", href: "/research" },
      { label: "Workspace demo", href: "/workspace" },
      { label: "Source on GitHub", href: REPO_URL, external: true },
      { label: "For agents (llms.txt)", href: "/llms.txt", external: true },
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

const linkClass = "text-sm text-muted-foreground transition-colors hover:text-foreground";
const iconLinkClass = "text-muted-foreground transition-colors hover:text-foreground";

function FooterAnchor({ link }: { link: FooterLink }) {
  return link.external ? (
    <a href={link.href} target="_blank" rel="noreferrer" className={linkClass}>
      {link.label}
    </a>
  ) : (
    <Link href={link.href} className={linkClass}>
      {link.label}
    </Link>
  );
}

export function Footer() {
  return (
    <footer className="border-t">
      <div className="px-6 py-10 sm:py-12">
        <div className="flex flex-col gap-10 sm:flex-row sm:justify-between">
          <div className="space-y-3">
            <Link href="/" className="logo-link flex items-center gap-2 text-sm font-semibold tracking-tight">
              <AnimatedOrigami className="size-4" />
              AI Patterns
            </Link>
            <p className="text-sm text-muted-foreground">Show your agents the patterns that work</p>
            <div className="flex items-center gap-4 pt-2">
              <a href={REPO_URL} target="_blank" rel="noreferrer" aria-label="Source on GitHub" className={iconLinkClass}>
                <GithubMark className="size-4" />
              </a>
              <Link href="/skill" aria-label="Claude Code skill" className={iconLinkClass}>
                <Sparkles className="size-4" />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3 sm:gap-x-0">
            {columns.map((column) => (
              <div key={column.heading} className="space-y-3 sm:w-44">
                <p className="text-sm font-medium">{column.heading}</p>
                <ul className="space-y-2">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <FooterAnchor link={link} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 flex items-center justify-between gap-4 border-t pt-6">
          <p className="text-sm text-muted-foreground">
            Made with{" "}
            <Heart className="inline size-3.5 -translate-y-px fill-red-500 text-red-500" aria-hidden />
            <span className="sr-only">love</span> by{" "}
            <a
              href="https://carlosmarch.es/"
              target="_blank"
              rel="noreferrer"
              className="transition-colors hover:text-foreground"
            >
              Carlos March
            </a>
            <span className="hidden sm:inline"> · MIT licensed</span>
          </p>
          <ThemeToggle />
        </div>
      </div>
    </footer>
  );
}
