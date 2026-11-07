// The "job" facet: what a pattern does for the person using the AI product,
// as opposed to its category, which says what kind of UI it is. Every
// registry entry has exactly one job. Adapted from the pattern types in
// The Shape of AI (shapeof.ai), regrouped to fit this catalogue.
//
// Plain data only — no React — so agent endpoints can import it freely.

export const JOBS = [
  {
    id: "start",
    label: "Start",
    question: "I don't know what to ask",
    description: "Help people take the first step: onboarding, starter prompts and suggested next steps.",
  },
  {
    id: "ask",
    label: "Ask",
    question: "Do this for me",
    description: "Get intent into the AI: composers, voice, attachments and asking in context.",
  },
  {
    id: "steer",
    label: "Steer",
    question: "Do it this way",
    description: "Shape how the AI works: models, sources, triggers, procedures and refinements.",
  },
  {
    id: "oversee",
    label: "Oversee",
    question: "What is it doing, and can I step in?",
    description: "Show progress and reasoning while the AI works, and let people approve, pause or stop it.",
  },
  {
    id: "trust",
    label: "Trust",
    question: "Can I believe it, and what does it keep?",
    description: "Check results against sources, diffs and confidence, and make AI content and data handling visible.",
  },
  {
    id: "recover",
    label: "Recover",
    question: "Something went wrong",
    description: "Explain failures and limits, keep partial work, and offer a way forward.",
  },
] as const;

export type PatternJob = (typeof JOBS)[number]["id"];
export type JobInfo = (typeof JOBS)[number];

export const JOB_IDS = JOBS.map((job) => job.id) as PatternJob[];

export function getJob(id: string): JobInfo | undefined {
  return JOBS.find((job) => job.id === id);
}
