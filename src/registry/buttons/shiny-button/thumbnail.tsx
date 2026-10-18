import { Frame } from "@/components/thumbnail";

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
          <rect x={60} y={48} width={80} height={24} rx={12} />
        </clipPath>
      </defs>
      <rect x={60} y={48} width={80} height={24} rx={12} className="fill-foreground" />
      <g clipPath="url(#shiny-clip)">
        <rect x={112} y={30} width={20} height={60} fill="url(#shiny-sweep)" transform="skewX(-20)" />
      </g>
    </Frame>
  );
}
