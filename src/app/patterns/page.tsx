import Link from "next/link";

import { registry, type RegistryEntry } from "@/registry";

export default function PatternsIndexPage() {
  const byCategory: Record<string, RegistryEntry[]> = {};
  for (const entry of registry) {
    (byCategory[entry.category] ??= []).push(entry);
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Patterns</h1>
      <p className="mt-2 text-muted-foreground">
        Copy-paste animated UI patterns for AI products, organized by category.
      </p>

      <div className="mt-10 space-y-10">
        {Object.entries(byCategory).map(([category, entries]) => (
          <section key={category} id={category} className="scroll-mt-20">
            <h2 className="mb-4 text-lg font-medium capitalize">{category}</h2>
            <ul className="grid gap-3 sm:grid-cols-2">
              {entries.map(({ Thumbnail, ...entry }) => (
                <li key={entry.slug}>
                  <Link
                    href={`/patterns/${entry.category}/${entry.slug}`}
                    className="group block h-full overflow-hidden rounded-lg border transition-colors hover:bg-accent"
                  >
                    <div className="aspect-[5/3] border-b bg-muted/40 p-3 transition-colors group-hover:bg-muted/70">
                      <Thumbnail />
                    </div>
                    <div className="p-4">
                      <p className="font-medium">{entry.title}</p>
                      <p className="text-sm text-muted-foreground">{entry.description}</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </main>
  );
}
