import { Frame, Box, Button, Dot, Line, tone } from "@/components/thumbnail";

export default function HumanInTheLoopThumbnail() {
  return (
    <Frame>
      <Box x={40} y={12} w={120} h={96} />
      <Line x={52} y={22} w={80} className={tone.strong} />
      {[38, 52, 66].map((y, i) => (
        <g key={y}>
          {i === 0 && <Box x={48} y={y - 5} w={104} h={14} r={4} className={tone.muted} />}
          <Dot cx={56} cy={y + 2} r={3.5} className={i === 0 ? tone.strong : tone.card} />
          {i === 0 && <Dot cx={56} cy={y + 2} r={1.3} className="fill-background" />}
          <Line x={64} y={y} w={60 - i * 10} />
        </g>
      ))}
      <Dot cx={54} cy={95} r={1.5} className={tone.strong} />
      <Dot cx={59} cy={95} r={1.5} />
      <Dot cx={64} cy={95} r={1.5} />
      <Button x={94} y={90} w={24} outline />
      <Button x={122} y={90} w={28} />
    </Frame>
  );
}
