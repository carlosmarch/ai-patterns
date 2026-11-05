import type { Metadata } from "next";
import type { ReactNode } from "react";

import { getCategories, registry } from "@/registry";
import { HomeFeatures } from "../home-features";
import {
  AskVariant,
  MarqueeVariant,
  StatsVariant,
  StepsVariant,
  TabsVariant,
  TerminalVariant,
  type SectionItem,
} from "./variants";

export const metadata: Metadata = {
  title: "Section variants — ai-patterns",
  description: "Alternative takes on the home page's feature section, side by side.",
  robots: { index: false },
};

// Same exclusions and search thumbnails as the home page.
const HIDDEN = new Set(["prompt-bar-pro", "shiny-button"]);
const SEARCH_THUMBS = ["tool-approval", "streaming-text", "inline-citation", "stop-generation-button", "generation-error", "sources-stack"];

export default function SectionsPage() {
  const visible = registry.filter((e) => !HIDDEN.has(e.slug));
  const items: SectionItem[] = visible.map(({ slug, category, title, Thumbnail }) => ({
    slug,
    category,
    title,
    thumb: <Thumbnail />,
  }));
  const searchThumbs = SEARCH_THUMBS.map((slug) => registry.find((e) => e.slug === slug))
    .filter((e) => e !== undefined)
    .map(({ slug, Thumbnail }) => (
      <div key={slug} className="rounded-md border bg-card p-1.5 dark:bg-background">
        <Thumbnail />
      </div>
    ));

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-16">
      <header className="max-w-xl">
        <p className="font-mono text-xs text-muted-foreground">/sections</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Section variants</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The home page&apos;s &ldquo;why&rdquo; bento and alternative shapes for the same story — find by
          behavior, copy the source, a spec per pattern, read by your agent.
        </p>
      </header>

      <Variant label="Current" name="Bento" note="What ships on the home page today." narrow>
        <HomeFeatures patternCount={visible.length} thumbnails={searchThumbs} />
      </Variant>

      <Variant label="A" name="Ask for a pattern" note="Split hero: a chat question answered with pattern cards.">
        <AskVariant items={items} />
      </Variant>

      <Variant label="B" name="Three moves" note="Find → Copy → Ship, with the active step walking along.">
        <StepsVariant />
      </Variant>

      <Variant label="C" name="Feature tabs" note="A vertical tab list drives one large preview; auto-advances, pauses on hover/focus.">
        <TabsVariant thumbnails={searchThumbs} />
      </Variant>

      <Variant label="D" name="Terminal" note="The agent visibly reads the spec before it writes the component.">
        <TerminalVariant />
      </Variant>

      <Variant label="E" name="Marquee wall" note="The catalogue drifting behind a centred pitch.">
        <MarqueeVariant items={items} patternCount={visible.length} />
      </Variant>

      <Variant label="F" name="Numbers" note="A quiet stats strip with the credit line beneath." narrow>
        <StatsVariant patternCount={visible.length} categoryCount={getCategories().length} />
      </Variant>
    </main>
  );
}

function Variant({
  label,
  name,
  note,
  narrow,
  children,
}: {
  label: string;
  name: string;
  note: string;
  /** Render at the home page's content width (max-w-3xl). */
  narrow?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="mt-16 border-t pt-6">
      <div className="mb-8 flex items-baseline gap-3">
        <span className="rounded-md border px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">{label}</span>
        <p className="text-sm font-medium">{name}</p>
        <p className="hidden text-xs text-muted-foreground sm:block">{note}</p>
      </div>
      <div className={narrow ? "mx-auto max-w-3xl" : undefined}>{children}</div>
    </div>
  );
}
