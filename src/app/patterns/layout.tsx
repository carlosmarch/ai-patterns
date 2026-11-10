import { PatternsSidebar } from "@/components/patterns-sidebar";
import { getSidebarGroups } from "@/registry";

// Shared by /patterns (the Details view) and every /patterns/<category>/<slug>
// page. Layouts stay mounted across navigations inside them, so the sidebar is
// the same instance on both: moving between the index and a pattern keeps its
// place and its scroll instead of re-rendering it somewhere else. It sits at
// the very left of the viewport, lined up with the site header's logo, and
// sticks below the header while the page scrolls.
export default function PatternsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex w-full">
      <PatternsSidebar groups={getSidebarGroups()} className="w-64 pl-4 sm:pl-6" />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
