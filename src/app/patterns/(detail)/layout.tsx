import { PatternsSidebar, type PatternsSidebarGroup } from "@/components/patterns-sidebar";
import { registry } from "@/registry";

// Route group layout for /patterns/<category>/<slug>: it stays mounted while
// moving between patterns, so the sidebar keeps its scroll position. The sidebar
// itself is fixed, so it stays on screen while the page scrolls.
export default function PatternDetailLayout({ children }: { children: React.ReactNode }) {
  const groups: PatternsSidebarGroup[] = [];
  for (const { category, slug, title } of registry) {
    let group = groups.find((g) => g.category === category);
    if (!group) {
      group = { category, items: [] };
      groups.push(group);
    }
    group.items.push({ slug, title });
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl gap-8 px-6">
      <PatternsSidebar groups={groups} />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
