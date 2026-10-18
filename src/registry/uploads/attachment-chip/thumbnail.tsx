import { Frame, Box, Dot, Line, tone } from "@/components/thumbnail";

export default function AttachmentChipThumbnail() {
  return (
    <Frame>
      <Box x={24} y={24} w={152} h={72} r={12} />
      <Box x={36} y={36} w={24} h={24} r={5} className={tone.muted} />
      <Box x={66} y={36} w={56} h={24} r={5} />
      <Line x={74} y={43} w={36} className={tone.strong} />
      <Line x={74} y={52} w={40} h={2} className={tone.faint} />
      <Line x={74} y={52} w={24} h={2} className={tone.strong} />
      <Line x={36} y={76} w={70} />
      <Dot cx={160} cy={80} r={6} className={tone.strong} />
    </Frame>
  );
}
