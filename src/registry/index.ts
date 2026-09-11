import type { ComponentType } from "react";

import ShinyButtonDemo from "./buttons/shiny-button/demo";
import ThinkingLoaderDemo from "./loaders/thinking-loader/demo";
import ExpandableTraceDemo from "./traces/expandable-trace/demo";

export interface RegistryEntry {
  slug: string;
  category: string;
  title: string;
  description: string;
  Demo: ComponentType;
}

export const registry: RegistryEntry[] = [
  {
    slug: "shiny-button",
    category: "buttons",
    title: "Shiny Button",
    description: "A button with an animated light sweep across its surface.",
    Demo: ShinyButtonDemo,
  },
  {
    slug: "thinking-loader",
    category: "loaders",
    title: "Thinking Loader",
    description: "A loader with a shimmering label and a live elapsed-time counter.",
    Demo: ThinkingLoaderDemo,
  },
  {
    slug: "expandable-trace",
    category: "traces",
    title: "Expandable Trace",
    description: "A collapsible \"Thought for Xs\" summary that expands into a step-by-step trace.",
    Demo: ExpandableTraceDemo,
  },
];

export function getRegistryEntry(category: string, slug: string) {
  return registry.find((entry) => entry.category === category && entry.slug === slug);
}

export function getCategories() {
  return Array.from(new Set(registry.map((entry) => entry.category)));
}
