import { SourcesStack, type Source } from "./component";

function favicon(domain: string) {
  return `https://www.google.com/s2/favicons?sz=64&domain=${domain}`;
}

const SOURCES: Source[] = [
  {
    title: "Next.js Docs — App Router",
    domain: "nextjs.org",
    url: "https://nextjs.org/docs/app",
    faviconUrl: favicon("nextjs.org"),
  },
  {
    title: "Tailwind CSS v4.0",
    domain: "tailwindcss.com",
    url: "https://tailwindcss.com/blog/tailwindcss-v4",
    faviconUrl: favicon("tailwindcss.com"),
  },
  {
    title: "Motion for React",
    domain: "motion.dev",
    url: "https://motion.dev",
    faviconUrl: favicon("motion.dev"),
  },
  {
    title: "Radix UI Primitives",
    domain: "radix-ui.com",
    url: "https://www.radix-ui.com/primitives",
    faviconUrl: favicon("radix-ui.com"),
  },
  {
    title: "shadcn/ui",
    domain: "ui.shadcn.com",
    url: "https://ui.shadcn.com",
    faviconUrl: favicon("ui.shadcn.com"),
  },
  {
    title: "Shiki — Syntax Highlighter",
    domain: "shiki.style",
    url: "https://shiki.style",
    faviconUrl: favicon("shiki.style"),
  },
  {
    title: "MDN Web Docs",
    domain: "developer.mozilla.org",
    url: "https://developer.mozilla.org/",
    faviconUrl: favicon("developer.mozilla.org"),
  },
];

export default function SourcesStackDemo() {
  return <SourcesStack sources={SOURCES} />;
}
