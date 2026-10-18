import { Frame, Box, Line, tone } from "@/components/thumbnail";

export default function ChatBubbleThumbnail() {
  return (
    <Frame>
      <Box x={92} y={12} w={88} h={22} r={11} className={tone.strong} />
      <Line x={104} y={21} w={64} className="fill-background/70" />
      <Line x={20} y={46} w={140} />
      <Line x={20} y={56} w={150} />
      <Line x={20} y={66} w={96} />
      {[0, 1, 2, 3].map((i) => (
        <Box key={i} x={20 + i * 13} y={80} w={9} h={9} r={2.5} className={i === 0 ? "fill-emerald-500/80" : tone.faint} />
      ))}
      <path d="M128 81 l-3 3.5 l3 3.5 M160 81 l3 3.5 l-3 3.5" className="stroke-muted-foreground" strokeWidth={1.2} strokeLinecap="round" />
      <Line x={136} y={82.5} w={16} h={3} />
    </Frame>
  );
}
