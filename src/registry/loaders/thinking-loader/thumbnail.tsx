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
      <path d="M50 54 l2 5 l5 2 l-5 2 l-2 5 l-2 -5 l-5 -2 l5 -2 z" className="fill-violet-500" />
      <rect x={64} y={57} width={64} height={6} rx={3} fill="url(#thinking-shimmer)" />
      <Line x={134} y={58} w={16} />
    </Frame>
  );
}
