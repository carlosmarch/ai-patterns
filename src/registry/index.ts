import type { ComponentType } from "react";

import ShinyButtonDemo from "./buttons/shiny-button/demo";

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
];

export function getRegistryEntry(category: string, slug: string) {
  return registry.find((entry) => entry.category === category && entry.slug === slug);
}

export function getCategories() {
  return Array.from(new Set(registry.map((entry) => entry.category)));
}
