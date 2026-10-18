import { Frame, Line } from "@/components/thumbnail";

export default function ShinyButtonThumbnail() {
  return (
    <Frame>
      <defs>
        <linearGradient id="shiny-sweep" x1="0" x2="1">
          <stop offset="0" className="[stop-color:var(--background)]" stopOpacity="0" />
          <stop offset="0.5" className="[stop-color:var(--background)]" stopOpacity="0.5" />
          <stop offset="1" className="[stop-color:var(--background)]" stopOpacity="0" />
        </linearGradient>
        <clipPath id="shiny-clip">
          <rect x={55} y={46} width={90} height={28} rx={14} />
        </clipPath>
      </defs>
      <rect x={55} y={46} width={90} height={28} rx={14} className="fill-foreground" />
      <g clipPath="url(#shiny-clip)">
        <rect x={112} y={30} width={22} height={60} fill="url(#shiny-sweep)" transform="skewX(-20)" />
      </g>
      <Line x={78} y={58} w={44} className="fill-background/70" />
    </Frame>
  );
}
