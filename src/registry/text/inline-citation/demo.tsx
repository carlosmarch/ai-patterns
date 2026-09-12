import { InlineCitation, type CitationSource } from "./component";

const SOURCES: CitationSource[] = [
  {
    title: "Tailwind CSS v4.0",
    domain: "tailwindcss.com",
    snippet: "A ground-up rewrite of the framework, built for the modern web.",
    url: "https://tailwindcss.com/blog/tailwindcss-v4",
  },
  {
    title: "Motion for React",
    domain: "motion.dev",
    snippet: "A production-ready animation library for React and JavaScript.",
    url: "https://motion.dev",
  },
];

export default function InlineCitationDemo() {
  return (
    <p className="max-w-md text-sm leading-relaxed text-foreground/90">
      Tailwind v4 moved its configuration into CSS itself, dropping the old{" "}
      <code className="rounded bg-muted px-1 py-0.5 text-xs">tailwind.config.js</code> file entirely
      <InlineCitation index={1} source={SOURCES[0]} />. Motion, formerly Framer Motion, now ships a
      smaller core bundle aimed specifically at this kind of micro-interaction
      <InlineCitation index={2} source={SOURCES[1]} />.
    </p>
  );
}
