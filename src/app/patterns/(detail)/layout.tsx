import { PatternsSidebar, type PatternsSidebarGroup } from "@/components/patterns-sidebar";
import { PatternExpandProvider } from "@/components/pattern-expand";
import { isNewEntry, registry } from "@/registry";

// Route group layout for /patterns/<category>/<slug>: it stays mounted while
// moving between patterns. The sidebar sticks below the header and scrolls on
// its own, so the selected pattern stays in view beside its page.
export default function PatternDetailLayout({ children }: { children: React.ReactNode }) {
  const groups: PatternsSidebarGroup[] = [];
  for (const entry of registry) {
    const { category, slug, title } = entry;
    let group = groups.find((g) => g.category === category);
    if (!group) {
      group = { category, items: [] };
      groups.push(group);
    }
    group.items.push({ slug, title, isNew: isNewEntry(entry) });
  }

  return (
    <PatternExpandProvider>
      <div className="mx-auto flex w-full max-w-6xl gap-8 px-6">
        <PatternsSidebar groups={groups} />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </PatternExpandProvider>
  );
}
