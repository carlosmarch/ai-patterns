import { Frame, Box, Button, Line, tone } from "@/components/thumbnail";

export default function CreateAgentThumbnail() {
  return (
    <Frame>
      <Box x={50} y={16} w={100} h={88} />
      <Box x={62} y={28} w={16} h={16} r={4} className={tone.muted} />
      <Line x={84} y={34} w={50} className={tone.strong} />
      <Box x={62} y={56} w={6} h={6} r={1.5} className={tone.strong} />
      <Line x={74} y={57} w={50} />
      <Box x={62} y={70} w={6} h={6} r={1.5} />
      <Line x={74} y={71} w={36} />
      <Button x={108} y={86} w={30} />
    </Frame>
  );
}
