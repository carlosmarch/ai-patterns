import { Frame, Box, Button, Line, tone } from "@/components/thumbnail";

export default function GenerationErrorThumbnail() {
  return (
    <Frame>
      <Box x={36} y={18} w={128} h={84} r={8} />
      <Line x={48} y={30} w={60} className={tone.strong} />
      <Box x={48} y={42} w={104} h={28} r={4} className={tone.muted} />
      <Line x={54} y={49} w={80} h={3} className={tone.mid} />
      <Line x={54} y={58} w={60} h={3} />
      <Button x={124} y={82} w={28} />
    </Frame>
  );
}
