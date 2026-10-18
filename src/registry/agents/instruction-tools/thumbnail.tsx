import { Frame, Box, Dot, Line, tone } from "@/components/thumbnail";

export default function InstructionToolsThumbnail() {
  return (
    <Frame>
      <Box x={24} y={12} w={152} h={96} />
      {[24, 38, 52].map((y, i) => (
        <g key={y}>
          <Line x={34} y={y} w={4} className={tone.strong} />
          <Line x={44} y={y} w={i === 1 ? 36 : 96 - i * 20} />
        </g>
      ))}
      <Box x={84} y={35} w={34} h={10} r={5} className="fill-violet-500/20 stroke-violet-500" />
      <Dot cx={90} cy={40} r={2} className="fill-violet-500" />
      <Line x={95} y={38.5} w={18} h={3} className="fill-violet-500" />
      <Box x={44} y={62} w={70} h={40} r={5} className={tone.card} />
      <Box x={47} y={65} w={64} h={10} r={3} className={tone.muted} />
      {[67, 79, 91].map((y) => (
        <g key={y}>
          <Box x={51} y={y} w={6} h={6} r={1.5} className={tone.text} />
          <Line x={61} y={y + 1} w={36} />
        </g>
      ))}
    </Frame>
  );
}
