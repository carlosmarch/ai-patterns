import { Frame, Dot, Line, tone } from "@/components/thumbnail";

export default function AnalysisListThumbnail() {
  return (
    <Frame>
      <Line x={24} y={16} w={152} h={3} className={tone.faint} />
      <Line x={64} y={16} w={56} h={3} className={tone.strong} />
      {[34, 54, 74, 94].map((y, i) => (
        <g key={y}>
          <Dot cx={32} cy={y + 2} r={4} className={i < 2 ? tone.strong : tone.faint} />
          <Line x={44} y={y} w={[110, 90, 100, 80][i]} className={i < 2 ? tone.text : tone.faint} />
        </g>
      ))}
    </Frame>
  );
}
