import { Frame, Box, Dot, Line, tone } from "@/components/thumbnail";

export default function ContextChipsThumbnail() {
  return (
    <Frame>
      <Box x={30} y={8} w={84} h={50} r={7} />
      <Line x={40} y={18} w={28} h={3} className={tone.faint} />
      {[26, 36, 46].map((y, i) => (
        <g key={y}>
          <Dot cx={42} cy={y + 2} r={2} className={tone.mid} />
          <Line x={48} y={y} w={i === 0 ? 40 : 32} className={i === 0 ? tone.strong : tone.text} />
        </g>
      ))}
      <Box x={30} y={64} w={140} h={48} r={10} />
      <Box x={38} y={70} w={38} h={11} r={4} className={tone.muted} />
      <Box x={80} y={70} w={34} h={11} r={4} className={tone.muted} />
      <Box x={118} y={70} w={30} h={11} r={4} dashed className={tone.card} />
      <Line x={40} y={88} w={60} />
      <Dot cx={42} cy={103} r={3} className={tone.mid} />
      <Dot cx={160} cy={102} r={5} className={tone.strong} />
    </Frame>
  );
}
