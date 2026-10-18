import { Frame, Box, Line, tone } from "@/components/thumbnail";

export default function CommandPaletteThumbnail() {
  return (
    <Frame>
      <rect width={200} height={120} rx={8} className="fill-foreground/5" />
      <Box x={44} y={16} w={112} h={88} r={10} />
      <Line x={56} y={28} w={60} className={tone.faint} />
      <Line x={44} y={40} w={112} h={0.75} className={tone.faint} />
      {[50, 66, 82].map((y, i) => (
        <g key={y}>
          {i === 0 && <Box x={50} y={y - 4} w={100} h={12} r={4} className={tone.muted} />}
          <Line x={58} y={y} w={[64, 50, 58][i]} className={i === 0 ? tone.strong : tone.text} />
        </g>
      ))}
    </Frame>
  );
}
