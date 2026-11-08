import { Frame, Box, Button, Dot, Line, tone } from "@/components/thumbnail";

export default function PromptQualityThumbnail() {
  return (
    <Frame>
      <Box x={30} y={20} w={140} h={58} r={10} />
      <Line x={42} y={32} w={76} />
      <Line x={42} y={60} w={14} h={4} className={tone.strong} />
      <Line x={59} y={60} w={14} h={4} className={tone.strong} />
      <Line x={76} y={60} w={14} h={4} className={tone.faint} />
      <Line x={93} y={60} w={14} h={4} className={tone.faint} />
      <Dot cx={158} cy={64} r={6} className={tone.strong} />
      <Button x={32} y={86} w={30} h={10} className={tone.faint} />
      <Button x={66} y={86} w={34} h={10} className={tone.faint} />
      <Box x={104} y={86} w={30} h={10} r={5} dashed />
      <Box x={138} y={86} w={30} h={10} r={5} dashed />
    </Frame>
  );
}
