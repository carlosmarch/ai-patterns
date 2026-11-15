import { Frame, Box, Button, Dot, Line, tone } from "@/components/thumbnail";

export default function ScheduledTaskThumbnail() {
  return (
    <Frame>
      <Line x={30} y={14} w={120} />
      <Line x={30} y={22} w={84} />
      <Button x={30} y={34} w={42} h={9} className={tone.faint} />
      <Box x={30} y={48} w={140} h={32} r={10} />
      <Dot cx={46} cy={64} r={7} className={tone.muted} />
      <Line x={60} y={57} w={64} className={tone.strong} />
      <Line x={60} y={67} w={34} />
      <Dot cx={156} cy={64} r={3} className={tone.mid} />
      <Button x={30} y={88} w={44} h={14} outline />
      <Line x={40} y={93} w={24} className={tone.mid} />
    </Frame>
  );
}
