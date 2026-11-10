import { PatternExpandProvider } from "@/components/pattern-expand";

// Route group layout for /patterns/<category>/<slug>: it stays mounted while
// moving between patterns, so prev/next keeps the preview expanded. The
// sidebar lives one level up, in patterns/layout.tsx, shared with /patterns.
export default function PatternDetailLayout({ children }: { children: React.ReactNode }) {
  return (
    <PatternExpandProvider>
      <div className="px-6">{children}</div>
    </PatternExpandProvider>
  );
}
