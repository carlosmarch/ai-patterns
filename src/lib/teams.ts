// The teams whose AI workflows the patterns are distilled from, drawn as
// app-icon tiles in the home page's credit strip.
import {
  siArc,
  siBox,
  siClaude,
  siCursor,
  siElevenlabs,
  siFigma,
  siFramer,
  siGithubcopilot,
  siGooglegemini,
  siHuggingface,
  siIntercom,
  siLinear,
  siMistralai,
  siMixpanel,
  siMongodb,
  siNotion,
  siPerplexity,
  siPosthog,
  siRaycast,
  siReplit,
  siSentry,
  siSupabase,
  siV0,
  siWarp,
  siWindsurf,
  siZedindustries,
  type SimpleIcon,
} from "simple-icons";

// Stable ids, used by registry entries' `seenIn` to credit where a pattern ships.
export const TEAM_IDS = [
  "orca",
  "cursor",
  "intercom",
  "claude",
  "perplexity",
  "linear",
  "raycast",
  "notion",
  "zed",
  "v0",
  "huggingface",
  "gemini",
  "elevenlabs",
  "replit",
  "copilot",
  "framer",
  "arc",
  "figma",
  "mistral",
  "windsurf",
  "warp",
  // Credited on patterns only, not in the home page strip.
  "chatgpt",
  "lovable",
  "lmarena",
  "box",
  "posthog",
  "sentry",
  "supabase",
  "mixpanel",
  "mongodb",
] as const;

export type TeamId = (typeof TEAM_IDS)[number];

export type Team = { id: TeamId; name: string; bg: string } & (
  // A simple-icons glyph drawn on a tile, coloured to read like the team's app icon…
  | { path: string; fg: string; src?: never; mark?: never }
  // …or the team's own app icon artwork, for logos simple-icons doesn't carry…
  | { src: string; path?: never; fg?: never; mark?: never }
  // …or a lettermark, for products with neither.
  | { mark: string; fg: string; path?: never; src?: never }
);

/** One product a pattern has been seen in, with the public page that shows it. */
export type SeenIn = { team: TeamId; source: string };

const glyph = (id: TeamId, icon: SimpleIcon, bg: string, fg = "#fff"): Team => ({
  id,
  name: icon.title,
  path: icon.path,
  bg,
  fg,
});

// The teams whose AI workflows the patterns are distilled from. Ordered so
// neighbouring tiles contrast; three consecutive entries are on screen at once,
// and a length divisible by three keeps every rotation free of repeats.
export const TEAMS: Team[] = [
  { id: "orca", name: "Orca", src: "/teams/orca.png", bg: "#0b0b0b" },
  glyph("cursor", siCursor, "linear-gradient(145deg,#2a2a2a,#050505)"),
  glyph("intercom", siIntercom, "linear-gradient(145deg,#3b5cff,#1f3bd6)"),
  glyph("claude", siClaude, "linear-gradient(145deg,#e48a6a,#c15f3c)"),
  glyph("perplexity", siPerplexity, "linear-gradient(145deg,#1d3a3f,#0b1f22)", "#20b8cd"),
  glyph("linear", siLinear, "linear-gradient(145deg,#7b85e6,#4450c4)"),
  glyph("raycast", siRaycast, "linear-gradient(145deg,#ff7b7b,#e0383e)"),
  glyph("notion", siNotion, "linear-gradient(145deg,#ffffff,#ececec)", "#111"),
  glyph("zed", siZedindustries, "linear-gradient(145deg,#1a6be0,#0a3f9a)"),
  glyph("v0", siV0, "linear-gradient(145deg,#262626,#000)"),
  glyph("huggingface", siHuggingface, "linear-gradient(145deg,#ffe066,#ffc21a)", "#1f1f1f"),
  glyph("gemini", siGooglegemini, "linear-gradient(145deg,#4f8ef7,#9b72cb)"),
  glyph("elevenlabs", siElevenlabs, "linear-gradient(145deg,#f4f4f4,#dcdcdc)", "#111"),
  glyph("replit", siReplit, "linear-gradient(145deg,#ff8a3d,#e8560a)"),
  glyph("copilot", siGithubcopilot, "linear-gradient(145deg,#3a2a6b,#0d1117)"),
  glyph("framer", siFramer, "linear-gradient(145deg,#2f7bff,#0047e0)"),
  glyph("arc", siArc, "linear-gradient(145deg,#3a3ff5,#1b1fb0)", "#ff9aa0"),
  glyph("figma", siFigma, "linear-gradient(145deg,#2c2c2c,#111)"),
  glyph("mistral", siMistralai, "linear-gradient(145deg,#ffb347,#fa520f)"),
  glyph("windsurf", siWindsurf, "linear-gradient(145deg,#1f3d38,#0b100f)", "#5fe0c4"),
  glyph("warp", siWarp, "linear-gradient(145deg,#2fb6ff,#0170c9)"),
];

// Products credited in patterns' "Seen in" rows that aren't in the home strip.
const CREDITED: Team[] = [
  { id: "chatgpt", name: "ChatGPT", mark: "G", fg: "#fff", bg: "linear-gradient(145deg,#2a2a2a,#050505)" },
  { id: "lovable", name: "Lovable", mark: "L", fg: "#fff", bg: "linear-gradient(145deg,#ff8a6b,#e0457b)" },
  { id: "lmarena", name: "LMArena", mark: "A", fg: "#fff", bg: "linear-gradient(145deg,#3d3d3d,#141414)" },
  glyph("box", siBox, "linear-gradient(145deg,#2f86ff,#0061d5)"),
  glyph("posthog", siPosthog, "linear-gradient(145deg,#fff4dc,#f3e3bf)", "#1d1f27"),
  glyph("sentry", siSentry, "linear-gradient(145deg,#4a3f78,#362d59)"),
  glyph("supabase", siSupabase, "linear-gradient(145deg,#1f2a25,#0f1512)", "#3fcf8e"),
  glyph("mixpanel", siMixpanel, "linear-gradient(145deg,#9a7dff,#5b3fe0)"),
  glyph("mongodb", siMongodb, "linear-gradient(145deg,#1f3b2c,#0b1d14)", "#47a248"),
];

const TEAMS_BY_ID = new Map([...TEAMS, ...CREDITED].map((team) => [team.id, team]));

export function getTeams(ids: readonly TeamId[]): Team[] {
  return ids.map((id) => TEAMS_BY_ID.get(id)).filter((team): team is Team => Boolean(team));
}
