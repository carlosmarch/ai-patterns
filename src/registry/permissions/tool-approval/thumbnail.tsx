import { Frame, Box, Button, Line, tone } from "@/components/thumbnail";

export default function ToolApprovalThumbnail() {
  return (
    <Frame>
      <Box x={30} y={16} w={140} h={88} r={8} />
      <Box x={42} y={27} w={14} h={14} r={4} className="fill-amber-500" />
      <Line x={62} y={28} w={56} className={tone.strong} />
      <Line x={62} y={36} w={36} h={3} />
      <Box x={42} y={50} w={116} h={22} r={4} className={tone.muted} />
      <Line x={48} y={56} w={80} h={3} className="fill-muted-foreground/50" />
      <Line x={48} y={63} w={56} h={3} className="fill-muted-foreground/50" />
      <Button x={60} y={84} w={26} outline />
      <Button x={90} y={84} w={34} outline />
      <Button x={128} y={84} w={30} />
    </Frame>
  );
}
