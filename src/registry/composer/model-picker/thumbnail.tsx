import { Frame, Box, Dot, Line, tone } from "@/components/thumbnail";

export default function ModelPickerThumbnail() {
  return (
    <Frame>
      <Box x={40} y={12} w={96} h={64} r={8} />
      <Box x={44} y={30} w={88} h={16} r={5} className={tone.muted} />
      {[20, 38, 56].map((y, i) => (
        <g key={y}>
          <Line x={52} y={y} w={i === 1 ? 40 : 32} className={i === 1 ? tone.strong : tone.text} />
          <Line x={52} y={y + 7} w={56} h={3} className={tone.faint} />
        </g>
      ))}
      <Dot cx={124} cy={38} r={2.5} className={tone.strong} />
      <Box x={30} y={84} w={140} h={26} r={9} />
      <Line x={40} y={95} w={30} className={tone.mid} />
      <Dot cx={158} cy={97} r={6} className={tone.strong} />
    </Frame>
  );
}
