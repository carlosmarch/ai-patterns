import { Frame, Dot, Line, tone } from "@/components/thumbnail";

export default function ExpandableTraceThumbnail() {
  return (
    <Frame>
      <path d="M38 22 l4 4 l4 -4" className="stroke-muted-foreground" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" />
      <Line x={52} y={22} w={64} className={tone.strong} />
      <Line x={41} y={34} w={1.5} h={64} className={tone.faint} />
      {[36, 52, 68, 84].map((y, i) => (
        <g key={y}>
          <Dot cx={52} cy={y + 2} r={2.5} className={i < 3 ? tone.text : "stroke-sky-500"} dashed={i === 3} />
          <Line x={60} y={y} w={90 - (i % 2) * 30} />
          <Line x={60} y={y + 7} w={60 - (i % 3) * 10} h={3} className={tone.faint} />
        </g>
      ))}
    </Frame>
  );
}
