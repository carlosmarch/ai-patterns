import { PatternsList } from "@/components/patterns-list";

export default function PatternsIndexPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Patterns</h1>
      <p className="mt-2 text-muted-foreground">
        Copy-paste animated UI patterns for AI products, organized by category.
      </p>
      <PatternsList />
    </main>
  );
}
