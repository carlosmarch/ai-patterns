import { Box, Dot, Frame, Line, tone } from "@/components/thumbnail";

export default function CodePreviewThumbnail() {
  return (
    <Frame>
      <Box x={30} y={22} w={140} h={76} r={8} className={tone.muted} />
      <Line x={40} y={32} w={18} className={tone.mid} />
      <Dot cx={146} cy={34} r={3} className={tone.faint} />
      <Dot cx={158} cy={34} r={4.5} className={tone.strong} />
      <Line x={40} y={50} w={70} />
      <Line x={48} y={60} w={92} />
      <Line x={48} y={70} w={60} />
      <Line x={40} y={80} w={40} />
    </Frame>
  );
}
