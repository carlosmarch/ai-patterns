import { Frame, Box, Line, tone } from "@/components/thumbnail";

export default function ImagePeekThumbnail() {
  return (
    <Frame>
      <Box x={58} y={10} w={84} h={70} r={8} />
      <Box x={64} y={16} w={72} h={44} r={4} className="fill-violet-500/25" />
      <path d="M66 58 l20 -22 l14 14 l10 -8 l24 16 z" className="fill-violet-500/50" />
      <Line x={64} y={66} w={44} className={tone.strong} />
      <Line x={118} y={66} w={18} h={3} />
      <path d="M96 80 l4 5 l4 -5" className="fill-card stroke-border" />
      {[0, 1, 2, 3, 4].map((i) => (
        <Box
          key={i}
          x={64 + i * 15}
          y={92}
          w={12}
          h={12}
          r={3}
          className={i === 2 ? "fill-violet-500/60 stroke-violet-500" : "fill-muted-foreground/20 stroke-border"}
        />
      ))}
    </Frame>
  );
}
