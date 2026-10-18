import { Frame, Box, Dot, Line, tone } from "@/components/thumbnail";

export default function RateLimitThumbnail() {
  return (
    <Frame>
      <Box x={40} y={16} w={120} h={88} r={10} />
      <Dot cx={100} cy={38} r={10} className="fill-amber-500/15 stroke-amber-500" />
      <path d="M100 32 V38 L104 41" className="stroke-amber-500" strokeWidth={1.4} strokeLinecap="round" />
      <Line x={66} y={56} w={68} className={tone.strong} />
      {[0, 1, 3, 4].map((i) => (
        <Box key={i} x={72 + i * 12} y={68} w={10} h={14} r={2.5} className={tone.muted} />
      ))}
      <Dot cx={101} cy={72} r={1} className={tone.strong} />
      <Dot cx={101} cy={78} r={1} className={tone.strong} />
      <Line x={74} y={92} w={52} h={3} />
    </Frame>
  );
}
