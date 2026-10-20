// Copy for the skill, shared by the /skill page and the workspace's Skill
// view so both always say the same thing.

export const INSTALL_COMMAND = `/plugin marketplace add carlosmarch/ai-patterns
/plugin install ai-patterns@ai-patterns`;

export const SKILL_TAGLINE =
  "A design-engineering expert for AI product prototypes, installed straight into your coding agent.";

export function SkillPitch() {
  return (
    <>
      Point it at a screen or flow you&apos;re building — a composer, a loading state, an agent
      trace, a diff review — and it shortlists from this catalogue, weighs each pattern&apos;s{" "}
      <em>when to use</em> against its <em>when not to use</em>, and scaffolds the one that
      actually fits. Not a component picker: a second opinion with taste.
    </>
  );
}

export const SKILL_PILLARS = [
  {
    title: "Recommends",
    body: "Shortlists candidates and justifies each pick against the pattern's own design rules — never forces a close-but-wrong fit.",
  },
  {
    title: "Adapts",
    body: "Defaults to this catalogue's look. Already have a design system? It keeps the UX contract and re-expresses it in yours.",
  },
  {
    title: "Grows",
    body: "Every pattern added to this catalogue is generated straight into the skill's reference material — nothing hand-duplicated, nothing to forget.",
  },
];

export const SKILL_MODES = [
  {
    mode: "list",
    body: "Lists every pattern in the catalogue as a numbered inventory, grouped by category.",
    trigger: "/ai-patterns list all patterns",
  },
  {
    mode: "review",
    body: "Scans your project for hand-rolled UI a catalogue pattern could replace. Read-only — nothing gets edited.",
    trigger: "/ai-patterns review my project",
  },
  {
    mode: "apply",
    body: "Auto-detects the best-fit pattern, proposes it with a rationale, then scaffolds it once you confirm.",
    trigger: "/ai-patterns add a loading state while the agent is working",
  },
];

export const SKILL_STEPS = [
  {
    title: "Understand the task, not just the component named",
    body: "“Add a loading state” is really “what does the user need to know while this is happening” — that’s what points at a Thinking Loader instead of a progress bar, or vice versa.",
  },
  {
    title: "Shortlist, then read the full spec",
    body: "Every pattern has a Summary, When to use, When not to use, Anatomy, Behavior, Content guidelines, and Accessibility section. The index alone is never enough to recommend from.",
  },
  {
    title: "Check what your project already looks like",
    body: "No established design system yet? It uses this catalogue's own Tailwind + Radix + Motion implementation as-is.",
  },
  {
    title: "Scaffold with the contract intact",
    body: "Already on shadcn, MUI, Chakra, or your own system? The behavior, content, and accessibility rules carry over — only the markup, styling, and motion API change.",
  },
  {
    title: "Say so when nothing fits",
    body: "If the catalogue doesn't have an answer, it says that plainly instead of stretching the nearest pattern to cover a case it wasn't designed for.",
  },
];

export const SKILL_STATS_BODY =
  "The skill never ships stale docs: its reference material is generated straight from this catalogue, so a new pattern here is a new capability there the moment it's regenerated and pushed.";
