import { Frame, Box, Button, Line, tone } from "@/components/thumbnail";

export default function ToolApprovalThumbnail() {
  return (
    <Frame>
      <Box x={36} y={18} w={128} h={84} r={8} />
      <Line x={48} y={30} w={60} className={tone.strong} />
      <Box x={48} y={42} w={104} h={20} r={4} className={tone.muted} />
      <Line x={54} y={50} w={70} h={3} className={tone.text} />
      <Button x={64} y={80} w={24} outline />
      <Button x={92} y={80} w={28} outline />
      <Button x={124} y={80} w={28} />
    </Frame>
  );
}
