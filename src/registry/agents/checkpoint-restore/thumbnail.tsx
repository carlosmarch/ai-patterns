import { Frame, Box, Button, Dot, Line, tone } from "@/components/thumbnail";

export default function CheckpointRestoreThumbnail() {
  return (
    <Frame>
      {[14, 58].map((y) => (
        <g key={y}>
          <Line x={30} y={y} w={56} h={1} className={tone.faint} />
          <Dot cx={100} cy={y + 0.5} r={3} dashed className={tone.card} />
          <Line x={114} y={y} w={56} h={1} className={tone.faint} />
        </g>
      ))}
      <Box x={110} y={22} w={60} h={12} r={6} className={tone.muted} />
      <Line x={30} y={40} w={96} />
      <Line x={30} y={48} w={70} />
      <Box x={30} y={68} w={140} h={42} r={8} />
      <Dot cx={42} cy={80} r={2.5} className={tone.strong} />
      <Line x={50} y={78} w={60} className={tone.mid} />
      <Dot cx={42} cy={90} r={2.5} dashed className={tone.card} />
      <Line x={50} y={88} w={44} />
      <Button x={136} y={95} w={26} h={9} />
    </Frame>
  );
}
