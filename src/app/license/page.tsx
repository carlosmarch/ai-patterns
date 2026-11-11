import { readFileSync } from "node:fs";
import { join } from "node:path";

import type { Metadata } from "next";

import { SITE_SHARE_IMAGE } from "@/lib/share";

const REPO_URL = "https://github.com/carlosmarch/ai-patterns";

const description = "AI Patterns is MIT licensed: copy, adapt and ship the components and specs in your own products.";

export const metadata: Metadata = {
  title: "License — AI Patterns",
  description,
  openGraph: { siteName: "AI Patterns", title: "License — AI Patterns", description, url: "/license", images: SITE_SHARE_IMAGE },
};

// Read at build time (the site is a static export), so the page always
// matches the LICENSE file at the repo root.
const LICENSE_TEXT = readFileSync(join(process.cwd(), "LICENSE"), "utf8").trim();

export default function LicensePage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-6 pt-14 pb-16">
      <p className="text-sm font-medium text-muted-foreground">License</p>
      <h1 className="mt-2 text-4xl font-semibold tracking-tight text-balance">MIT License</h1>
      <p className="mt-4 max-w-xl text-pretty text-muted-foreground">
        The components, pattern specs and site code are free to use, copy, modify and ship, in commercial projects too.
        Keep the copyright notice and this permission notice with substantial copies.
      </p>
      <pre className="mt-10 overflow-x-auto rounded-xl border bg-muted/40 p-6 font-mono text-[13px] leading-relaxed whitespace-pre-wrap">
        {LICENSE_TEXT}
      </pre>
      <p className="mt-6 text-sm text-muted-foreground">
        Source:{" "}
        <a
          href={`${REPO_URL}/blob/main/LICENSE`}
          target="_blank"
          rel="noreferrer"
          className="text-foreground underline-offset-4 hover:underline"
        >
          LICENSE on GitHub
        </a>
      </p>
    </main>
  );
}
