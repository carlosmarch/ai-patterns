import fs from "node:fs/promises";
import path from "node:path";
import Link from "next/link";
import { ArrowUpRight, Sparkles } from "lucide-react";

import { registry } from "@/registry";
import { CodeBlock } from "@/components/code-block";
import { ComponentPreview } from "@/components/component-preview";
import { DownloadButton } from "@/components/download-button";
import { HomeHero } from "./home-hero";

export default async function Home() {
  const featured = registry.find((entry) => entry.slug === "prompt-bar-pro");
  const rest = registry.filter((entry) => entry.slug !== featured?.slug);

  const sources = await Promise.all(
    rest.map((entry) =>
      fs.readFile(
        path.join(process.cwd(), "src/registry", entry.category, entry.slug, "component.tsx"),
        "utf-8"
      )
    )
  );

  return (
    <main>
      <section className="relative overflow-hidden border-b">
        <div
          aria-hidden
          className="absolute inset-0 -z-10 [background-image:linear-gradient(var(--color-border)_1px,transparent_1px),linear-gradient(90deg,var(--color-border)_1px,transparent_1px)] [background-size:64px_64px] [mask-image:radial-gradient(ellipse_60%_55%_at_50%_0%,black,transparent)]"
        />

        <div className="mx-auto w-full max-w-3xl px-6 pt-20 pb-16 text-center">
          <Link
            href="/skill"
            className="inline-flex items-center gap-1.5 rounded-full border bg-muted/40 px-3.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <Sparkles className="size-3.5" />
            Also ships as a Claude Code skill
          </Link>

          <h1 className="mt-6 text-5xl font-semibold tracking-tight text-balance sm:text-6xl">
            Design patterns for AI agents
          </h1>
          <p className="mx-auto mt-4 max-w-md text-muted-foreground">
            Production components for AI agent UIs — each ships with a UX spec the harness can
            read. Guardrails for what to render, when, and why.{" "}
            <Link href="/skill" className="text-foreground underline underline-offset-4">
              Use the skill.
            </Link>
          </p>

          {featured && (
            <div className="mx-auto mt-10 max-w-lg text-left">
              <HomeHero />
              <Link
                href={`/patterns/${featured.category}/${featured.slug}`}
                className="mt-4 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {featured.title}
                <ArrowUpRight className="size-3.5" />
              </Link>
            </div>
          )}
        </div>
      </section>

      <div className="mx-auto w-full max-w-3xl px-6 py-16">
        <div className="space-y-16">
          {rest.map((entry, i) => {
            const Demo = entry.Demo;
            const source = sources[i];
            return (
              <section key={entry.slug} className="space-y-3">
                <div className="flex items-baseline justify-between gap-4">
                  <div>
                    <h2 className="font-medium">{entry.title}</h2>
                    <p className="text-sm text-muted-foreground">{entry.description}</p>
                  </div>
                  <Link
                    href={`/patterns/${entry.category}/${entry.slug}`}
                    className="shrink-0 text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    View details →
                  </Link>
                </div>
                <ComponentPreview
                  preview={<Demo />}
                  code={<CodeBlock code={source} />}
                  pattern={
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-4">
                        <p className="text-sm text-muted-foreground">
                          A UX spec for this pattern — written for agents implementing or reusing it, not the code.
                        </p>
                        <DownloadButton
                          filename={`${entry.slug}.pattern.md`}
                          content={entry.uxDoc}
                          className="shrink-0"
                        />
                      </div>
                      <CodeBlock code={entry.uxDoc} lang="markdown" wrap />
                    </div>
                  }
                />
              </section>
            );
          })}
        </div>
      </div>
    </main>
  );
}
