import { SourceTrustCard, type TrustedSource } from "./component";

function favicon(domain: string) {
  return `https://www.google.com/s2/favicons?sz=64&domain=${domain}`;
}

const SOURCES: TrustedSource[] = [
  {
    title: "Next.js Docs — App Router",
    domain: "nextjs.org",
    description:
      "The official Next.js documentation for the App Router, covering layouts, server components, and file-based routing — the foundation ai-patterns is built on.",
    url: "https://nextjs.org/docs/app",
    faviconUrl: favicon("nextjs.org"),
    trustReason: "is trusted for official framework documentation, maintained directly by the Next.js core team.",
  },
  {
    title: "Motion for React",
    domain: "motion.dev",
    description:
      "The animation library behind every pattern in this registry — looping sheens, expand/collapse lists, and paginated carousels like this one.",
    url: "https://motion.dev",
    faviconUrl: favicon("motion.dev"),
  },
];

export default function SourceTrustCardDemo() {
  return <SourceTrustCard sources={SOURCES} />;
}
