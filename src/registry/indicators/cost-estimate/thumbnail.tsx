import { Frame, Box, Button, Line, tone } from "@/components/thumbnail";

export default function CostEstimateThumbnail() {
  return (
    <Frame>
      <Box x={30} y={24} w={140} h={72} r={8} />
      <Line x={42} y={36} w={30} h={3} />
      <Line x={42} y={44} w={46} h={7} className={tone.strong} />
      <Button x={130} y={38} w={28} h={12} />
      <Box x={42} y={66} w={116} h={6} r={3} className={tone.muted} />
      <Box x={42} y={66} w={70} h={6} r={3} className={tone.text} />
      <Box x={112} y={66} w={30} h={6} r={3} className={tone.strong} />
      <Line x={42} y={80} w={50} h={3} className={tone.faint} />
    </Frame>
  );
}
