import fs from "node:fs/promises";
import path from "node:path";
import { notFound } from "next/navigation";

import { BackButton } from "@/components/back-button";
import { CodeBlock } from "@/components/code-block";
import { ComponentPreview } from "@/components/component-preview";
import { DownloadButton } from "@/components/download-button";
import { getRegistryEntry, registry } from "@/registry";

export function generateStaticParams() {
  return registry.map(({ category, slug }) => ({ category, slug }));
}

export default async function ComponentPage({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}) {
  const { category, slug } = await params;
  const entry = getRegistryEntry(category, slug);

  if (!entry) {
    notFound();
  }

  const source = await fs.readFile(
    path.join(process.cwd(), "src/registry", category, slug, "component.tsx"),
    "utf-8"
  );
  const Demo = entry.Demo;

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-16">
      <BackButton fallbackHref="/components" className="mb-6" />

      <div className="mb-8 space-y-2">
        <p className="text-sm font-medium text-muted-foreground capitalize">{entry.category}</p>
        <h1 className="text-3xl font-semibold tracking-tight">{entry.title}</h1>
        <p className="text-muted-foreground">{entry.description}</p>
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
    </main>
  );
}
