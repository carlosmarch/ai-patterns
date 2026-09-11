import Link from "next/link";

import { registry } from "@/registry";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-16">
      <div className="mb-16 space-y-3 text-center">
        <h1 className="text-4xl font-semibold tracking-tight text-balance">
          Beautiful, copy-paste UI components
        </h1>
        <p className="mx-auto max-w-md text-muted-foreground">
          A small, growing library of animated React components you own the source to.
        </p>
      </div>

      <div className="space-y-16">
        {registry.map((entry) => {
          const Demo = entry.Demo;
          return (
            <section key={entry.slug} className="space-y-3">
              <div className="flex items-baseline justify-between gap-4">
                <div>
                  <h2 className="font-medium">{entry.title}</h2>
                  <p className="text-sm text-muted-foreground">{entry.description}</p>
                </div>
                <Link
                  href={`/components/${entry.category}/${entry.slug}`}
                  className="shrink-0 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  View details →
                </Link>
              </div>
              <div className="flex min-h-[220px] items-center justify-center rounded-xl border bg-muted/30 p-10">
                <Demo />
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}
