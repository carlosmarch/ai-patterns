import { PatternsSidebar } from "@/components/patterns-sidebar";
import { getSidebarGroups } from "@/registry";

// The catalogue: /gallery, /patterns (Details) and every pattern page share
// this layout (a route group, so URLs are unchanged). Layouts stay mounted
// across navigations inside them, so the patterns sidebar is the same instance
// everywhere here: switching views or opening a pattern keeps its place, its
// scroll and its compact/full mode. It sits at the very left of the viewport,
// lined up with the site header's logo, and sticks below the header.
export default function CatalogLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex w-full">
      <PatternsSidebar groups={getSidebarGroups()} />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
