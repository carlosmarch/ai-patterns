import type { Metadata } from "next";
import type { ReactNode } from "react";

import { registry } from "@/registry";
import { JOBS } from "@/registry/jobs";
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
import {
  AnatomyVariant,
  CompareVariant,
  ComparisonVariant,
  IndexVariant,
  OrbitVariant,
  SpotlightVariant,
} from "./variants-more";

export const metadata: Metadata = {
  title: "Section variants — ai-patterns",
  description: "Alternative takes on the home page's feature section, side by side.",
  robots: { index: false, follow: false },
};

// Same exclusions and search thumbnails as the home page.
const HIDDEN = new Set(["prompt-bar-pro", "shiny-button"]);
const SEARCH_THUMBS = ["tool-approval", "streaming-text", "inline-citation", "stop-generation-button", "generation-error", "sources-stack"];

const NAV = [
  { label: "Previous", name: "Bento" },
  { label: "A", name: "Ask for a pattern" },
  { label: "B", name: "Three moves" },
  { label: "C", name: "Feature tabs" },
  { label: "D", name: "Terminal" },
  { label: "E", name: "Marquee wall" },
  { label: "F", name: "Numbers" },
  { label: "G", name: "Before / after" },
  { label: "H", name: "Anatomy" },
  { label: "I", name: "Orbit" },
  { label: "J", name: "Index" },
  { label: "K", name: "Comparison" },
  { label: "L", name: "Spotlight grid" },
];

const anchor = (label: string) => `variant-${label.toLowerCase()}`;

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

      <nav
        aria-label="Variants"
        className="sticky top-14 z-30 -mx-6 mt-8 overflow-x-auto border-b bg-background/85 px-6 py-2.5 backdrop-blur [scrollbar-width:none]"
      >
        <ul className="flex w-max gap-1.5">
          {NAV.map((v) => (
            <li key={v.label}>
              <a
                href={`#${anchor(v.label)}`}
                className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <span className="font-mono text-[10px]">{v.label}</span>
                {v.name}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <Variant label="Previous" name="Bento" note="The previous home page block, kept for reference." narrow>
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
        <StatsVariant patternCount={visible.length} jobCount={JOBS.length} />
      </Variant>

      <Variant label="G" name="Before / after" note="Five requests; drag to compare what an agent writes without and with the pattern spec.">
        <CompareVariant />
      </Variant>

      <Variant label="H" name="Anatomy" note="A pattern with numbered callouts tied to a hoverable legend.">
        <AnatomyVariant />
      </Variant>

      <Variant label="I" name="Orbit" note="One skill at the centre, agents and patterns circling it.">
        <OrbitVariant />
      </Variant>

      <Variant label="J" name="Index" note="Editorial category list with a cursor-following thumbnail peek.">
        <IndexVariant items={items} />
      </Variant>

      <Variant label="K" name="Comparison" note="ai-patterns against a component library and an inspiration gallery." narrow>
        <ComparisonVariant />
      </Variant>

      <Variant label="L" name="Spotlight grid" note="Four features lit by a glow that follows the cursor across cards.">
        <SpotlightVariant />
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
    <div id={anchor(label)} className="mt-16 scroll-mt-28 border-t pt-6">
      <div className="mb-8 flex items-baseline gap-3">
        <span className="rounded-md border px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">{label}</span>
        <p className="text-sm font-medium">{name}</p>
        <p className="hidden text-xs text-muted-foreground sm:block">{note}</p>
      </div>
      <div className={narrow ? "mx-auto max-w-3xl" : undefined}>{children}</div>
    </div>
  );
}
