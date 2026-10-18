import { Frame, Box, Dot, Line, tone } from "@/components/thumbnail";

export default function RateLimitThumbnail() {
  return (
    <Frame>
      <Box x={48} y={22} w={104} h={76} r={10} />
      <Line x={68} y={36} w={64} className={tone.strong} />
      {[0, 1, 3, 4].map((i) => (
        <Box key={i} x={72 + i * 12} y={52} w={10} h={14} r={2.5} className={tone.muted} />
      ))}
      <Dot cx={101} cy={56} r={1} className={tone.strong} />
      <Dot cx={101} cy={62} r={1} className={tone.strong} />
      <Line x={76} y={80} w={48} h={3} />
    </Frame>
  );
}
