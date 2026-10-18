import { Frame, Box, Dot, Line, tone } from "@/components/thumbnail";

export default function SourcesStackThumbnail() {
  return (
    <Frame>
      <circle cx={44} cy={26} r={8} className="fill-muted-foreground/40 stroke-background" strokeWidth={2} />
      <circle cx={56} cy={26} r={8} className="fill-muted-foreground/60 stroke-background" strokeWidth={2} />
      <circle cx={68} cy={26} r={8} className="fill-foreground stroke-background" strokeWidth={2} />
      <Line x={82} y={24} w={24} />
      <Box x={36} y={46} w={128} h={60} r={8} />
      {[58, 74, 90].map((y, i) => (
        <g key={y}>
          <Dot cx={50} cy={y + 2} r={3} className={tone.mid} />
          <Line x={58} y={y} w={80 - i * 12} />
        </g>
      ))}
    </Frame>
  );
}
