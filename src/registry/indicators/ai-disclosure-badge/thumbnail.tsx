import { Frame, Box, Button, Line, tone } from "@/components/thumbnail";

export default function AiDisclosureBadgeThumbnail() {
  return (
    <Frame>
      <Box x={30} y={18} w={140} h={60} r={8} />
      <Line x={42} y={30} w={44} className={tone.strong} />
      <Button x={92} y={27} w={30} h={10} outline />
      <Line x={42} y={46} w={112} />
      <Line x={42} y={56} w={88} />
      <Box x={92} y={82} w={70} h={26} r={6} className={tone.muted} />
      <Line x={100} y={89} w={40} h={3} className={tone.mid} />
      <Line x={100} y={97} w={52} h={3} className={tone.faint} />
    </Frame>
  );
}
