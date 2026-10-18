import { Frame, Dot, Line, tone } from "@/components/thumbnail";

export default function MultiAgentTraceThumbnail() {
  return (
    <Frame>
      <Dot cx={46} cy={24} r={4} className={tone.strong} />
      <Line x={56} y={22} w={60} className={tone.strong} />
      <path d="M46 28 V92 M46 48 H60 M46 70 H60 M46 92 H60" className="stroke-border" strokeWidth={1.2} />
      {[48, 70, 92].map((y, i) => (
        <g key={y}>
          <Dot cx={66} cy={y} r={3} className={i === 0 ? tone.strong : i === 1 ? "stroke-muted-foreground" : tone.faint} dashed={i === 1} />
          <Line x={74} y={y - 2} w={70 - i * 10} />
        </g>
      ))}
    </Frame>
  );
}
