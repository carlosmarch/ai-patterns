import { Frame, Line } from "@/components/thumbnail";

export default function ThinkingLoaderThumbnail() {
  return (
    <Frame>
      <defs>
        <linearGradient id="thinking-shimmer" x1="0" x2="1">
          <stop offset="0" className="[stop-color:var(--muted-foreground)]" stopOpacity="0.25" />
          <stop offset="0.5" className="[stop-color:var(--foreground)]" stopOpacity="0.9" />
          <stop offset="1" className="[stop-color:var(--muted-foreground)]" stopOpacity="0.25" />
        </linearGradient>
      </defs>
      <rect x={60} y={57} width={60} height={6} rx={3} fill="url(#thinking-shimmer)" />
      <Line x={126} y={58} w={14} />
    </Frame>
  );
}
