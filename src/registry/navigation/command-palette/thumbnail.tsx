import { Frame, Box, Dot, Line, tone } from "@/components/thumbnail";

export default function CommandPaletteThumbnail() {
  return (
    <Frame>
      <rect width={200} height={120} rx={8} className="fill-foreground/5" />
      <Box x={36} y={12} w={128} h={96} r={10} />
      <Dot cx={50} cy={26} r={3.5} className="stroke-muted-foreground" />
      <Line x={60} y={24} w={60} className={tone.faint} />
      <Box x={136} y={20} w={18} h={11} r={3} className={tone.muted} />
      <Line x={140} y={24} w={10} h={3} />
      <Line x={36} y={38} w={128} h={0.75} className={tone.faint} />
      {[46, 62, 78, 94].map((y, i) => (
        <g key={y}>
          {i === 1 && <Box x={42} y={y - 3} w={116} h={14} r={4} className={tone.muted} />}
          <Box x={48} y={y} w={8} h={8} r={2} className={tone.text} />
          <Line x={62} y={y + 2} w={[60, 72, 50, 64][i]} className={i === 1 ? tone.strong : tone.text} />
        </g>
      ))}
    </Frame>
  );
}
