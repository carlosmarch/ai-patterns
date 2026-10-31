import { registry, type RegistryEntry } from "@/registry";
import { PatternCard } from "@/components/pattern-card";

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
            <div className="mb-4 flex items-baseline justify-between gap-4">
              <h2 className="text-sm font-medium capitalize">{category}</h2>
              <span className="font-mono text-[11px] text-muted-foreground">
                {entries.length} {entries.length === 1 ? "pattern" : "patterns"}
              </span>
            </div>
            <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {entries.map((entry) => (
                <li key={entry.slug}>
                  <PatternCard entry={entry} />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </main>
  );
}
