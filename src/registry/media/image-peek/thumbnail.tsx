import { Frame, Box, Line, tone } from "@/components/thumbnail";

export default function ImagePeekThumbnail() {
  return (
    <Frame>
      <Box x={62} y={12} w={76} h={60} r={8} />
      <Box x={68} y={18} w={64} h={40} r={4} className={tone.muted} />
      <Line x={68} y={63} w={40} />
      {[0, 1, 2, 3, 4].map((i) => (
        <Box key={i} x={66 + i * 14} y={86} w={10} h={10} r={2.5} className={i === 2 ? "fill-muted stroke-foreground" : tone.muted} />
      ))}
    </Frame>
  );
}
