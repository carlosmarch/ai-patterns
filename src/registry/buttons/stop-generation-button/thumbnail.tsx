import { Frame, Box, Dot, Line, tone } from "@/components/thumbnail";

export default function StopGenerationButtonThumbnail() {
  return (
    <Frame>
      <Line x={20} y={18} w={140} />
      <Line x={20} y={28} w={110} />
      <Line x={20} y={38} w={60} />
      <Box x={20} y={60} w={160} h={44} r={12} />
      <Line x={32} y={72} w={70} className={tone.faint} />
      <Dot cx={164} cy={88} r={9} className={tone.strong} />
      <Box x={160.5} y={84.5} w={7} h={7} r={1.5} className="fill-background" />
      <Dot cx={164} cy={88} r={12} className="stroke-foreground/20" />
    </Frame>
  );
}
