"use client";

import Link from "next/link";

import { GithubMark } from "@/components/github-mark";
import { trackGithubClicked } from "@/lib/analytics";

export function SkillCta() {
  return (
    <div className="mt-16 flex flex-wrap items-center gap-4 border-t pt-8">
      <Link
        href="/patterns"
        className="rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90"
      >
        Browse the catalogue
      </Link>
      <a
        href="https://github.com/carlosmarch/ai-patterns"
        target="_blank"
        rel="noreferrer"
        onClick={() => trackGithubClicked({ page: "skill" })}
        className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
      >
        <GithubMark className="size-4" />
        View source on GitHub
      </a>
    </div>
  );
}
