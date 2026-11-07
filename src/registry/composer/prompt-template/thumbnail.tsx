import { Frame, Box, Button, Line, tone } from "@/components/thumbnail";

export default function PromptTemplateThumbnail() {
  return (
    <Frame>
      <Box x={24} y={22} w={152} h={76} r={9} />
      <Line x={36} y={36} w={22} />
      <Box x={61} y={32} w={30} h={12} r={3} className={tone.muted} />
      <Line x={95} y={36} w={22} />
      <Box x={120} y={32} w={42} h={12} r={3} dashed className={tone.card} />
      <Line x={36} y={56} w={18} />
      <Box x={57} y={52} w={46} h={12} r={3} dashed className={tone.card} />
      <Line x={107} y={56} w={30} />
      <Button x={136} y={80} w={28} h={10} />
    </Frame>
  );
}
