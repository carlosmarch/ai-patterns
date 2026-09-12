export type DesignSystemId =
  | "shadcn"
  | "material"
  | "ant"
  | "chakra"
  | "carbon"
  | "bootstrap";

export interface DesignSystemOption {
  id: DesignSystemId;
  name: string;
  href: string;
}

export const designSystems: DesignSystemOption[] = [
  { id: "shadcn", name: "shadcn/ui", href: "https://ui.shadcn.com" },
  { id: "material", name: "Material Design 3", href: "https://m3.material.io" },
  { id: "ant", name: "Ant Design", href: "https://ant.design" },
  { id: "chakra", name: "Chakra UI", href: "https://www.chakra-ui.com" },
  { id: "carbon", name: "IBM Carbon", href: "https://carbondesignsystem.com" },
  { id: "bootstrap", name: "Bootstrap", href: "https://getbootstrap.com" },
];

export const DEFAULT_DESIGN_SYSTEM: DesignSystemId = "shadcn";

export const DESIGN_SYSTEM_STORAGE_KEY = "design-system";

export function isDesignSystemId(value: unknown): value is DesignSystemId {
  return designSystems.some((system) => system.id === value);
}
