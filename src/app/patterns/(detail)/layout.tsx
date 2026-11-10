import { PatternsSidebar } from "@/components/patterns-sidebar";
import { PatternExpandProvider } from "@/components/pattern-expand";
import { getSidebarGroups } from "@/registry";

// Route group layout for /patterns/<category>/<slug>: it stays mounted while
// moving between patterns. The sidebar sticks below the header and scrolls on
// its own, so the selected pattern stays in view beside its page.
export default function PatternDetailLayout({ children }: { children: React.ReactNode }) {
  const groups = getSidebarGroups();

  return (
    <PatternExpandProvider>
      <div className="mx-auto flex w-full max-w-6xl gap-8 px-6">
        <PatternsSidebar groups={groups} />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </PatternExpandProvider>
  );
}
