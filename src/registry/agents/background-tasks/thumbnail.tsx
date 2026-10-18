import { Frame, Box, Dot, Line, tone } from "@/components/thumbnail";

export default function BackgroundTasksThumbnail() {
  return (
    <Frame>
      <Line x={16} y={24} w={70} className={tone.faint} />
      <Line x={16} y={34} w={56} className={tone.faint} />
      <Box x={110} y={8} w={82} h={104} r={8} />
      {[22, 38, 54].map((y, i) => (
        <g key={y}>
          <Dot cx={122} cy={y + 2} r={3} className={i < 2 ? "stroke-muted-foreground" : tone.text} dashed={i < 2} />
          <Line x={130} y={y} w={48 - i * 8} className={i < 2 ? tone.strong : tone.text} />
        </g>
      ))}
    </Frame>
  );
}
