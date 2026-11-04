import { Frame, Box, Button, Line, tone } from "@/components/thumbnail";

export default function WaitTimeHandoffThumbnail() {
  return (
    <Frame>
      <Box x={40} y={12} w={120} h={96} />
      {/* Header */}
      <Line x={50} y={21} w={34} className={tone.mid} />
      {/* Duration: number + unit */}
      <Button x={50} y={33} w={22} outline />
      <Button x={76} y={33} w={32} outline />
      {/* Team / Workflow segmented control */}
      <Box x={50} y={50} w={100} h={12} r={6} className={tone.muted} />
      <Box x={101} y={52} w={47} h={8} r={4} />
      <Line x={66} y={54} w={18} />
      <Line x={114} y={54} w={22} className={tone.mid} />
      {/* Target + message */}
      <Button x={50} y={68} w={52} outline />
      <Box x={50} y={84} w={100} h={16} r={4} />
      <Line x={56} y={90} w={62} />
    </Frame>
  );
}
