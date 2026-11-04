// The teams whose AI workflows the patterns are distilled from, drawn as
// app-icon tiles in the home page's credit strip.
import {
  siArc,
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
  siNotion,
  siPerplexity,
  siRaycast,
  siReplit,
  siV0,
  siWarp,
  siWindsurf,
  siZedindustries,
  type SimpleIcon,
} from "simple-icons";

export type Team = { name: string; bg: string } & (
  // A simple-icons glyph drawn on a tile, coloured to read like the team's app icon…
  | { path: string; fg: string; src?: never }
  // …or the team's own app icon artwork, for logos simple-icons doesn't carry.
  | { src: string; path?: never; fg?: never }
);

const glyph = (icon: SimpleIcon, bg: string, fg = "#fff"): Team => ({
  name: icon.title,
  path: icon.path,
  bg,
  fg,
});

// The teams whose AI workflows the patterns are distilled from. Ordered so
// neighbouring tiles contrast; three consecutive entries are on screen at once,
// and a length divisible by three keeps every rotation free of repeats.
export const TEAMS: Team[] = [
  { name: "Orca", src: "/teams/orca.png", bg: "#0b0b0b" },
  glyph(siCursor, "linear-gradient(145deg,#2a2a2a,#050505)"),
  glyph(siIntercom, "linear-gradient(145deg,#3b5cff,#1f3bd6)"),
  glyph(siClaude, "linear-gradient(145deg,#e48a6a,#c15f3c)"),
  glyph(siPerplexity, "linear-gradient(145deg,#1d3a3f,#0b1f22)", "#20b8cd"),
  glyph(siLinear, "linear-gradient(145deg,#7b85e6,#4450c4)"),
  glyph(siRaycast, "linear-gradient(145deg,#ff7b7b,#e0383e)"),
  glyph(siNotion, "linear-gradient(145deg,#ffffff,#ececec)", "#111"),
  glyph(siZedindustries, "linear-gradient(145deg,#1a6be0,#0a3f9a)"),
  glyph(siV0, "linear-gradient(145deg,#262626,#000)"),
  glyph(siHuggingface, "linear-gradient(145deg,#ffe066,#ffc21a)", "#1f1f1f"),
  glyph(siGooglegemini, "linear-gradient(145deg,#4f8ef7,#9b72cb)"),
  glyph(siElevenlabs, "linear-gradient(145deg,#f4f4f4,#dcdcdc)", "#111"),
  glyph(siReplit, "linear-gradient(145deg,#ff8a3d,#e8560a)"),
  glyph(siGithubcopilot, "linear-gradient(145deg,#3a2a6b,#0d1117)"),
  glyph(siFramer, "linear-gradient(145deg,#2f7bff,#0047e0)"),
  glyph(siArc, "linear-gradient(145deg,#3a3ff5,#1b1fb0)", "#ff9aa0"),
  glyph(siFigma, "linear-gradient(145deg,#2c2c2c,#111)"),
  glyph(siMistralai, "linear-gradient(145deg,#ffb347,#fa520f)"),
  glyph(siWindsurf, "linear-gradient(145deg,#1f3d38,#0b100f)", "#5fe0c4"),
  glyph(siWarp, "linear-gradient(145deg,#2fb6ff,#0170c9)"),
];
