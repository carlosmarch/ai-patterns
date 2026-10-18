import { Frame, Line, tone } from "@/components/thumbnail";

export default function FollowUpListThumbnail() {
  return (
    <Frame>
      <Line x={24} y={14} w={60} h={3} className={tone.faint} />
      {[26, 48, 70, 92].map((y, i) => (
        <g key={y}>
          <path d={`M30 ${y + 4} h6 m-2.5 -2.5 l2.5 2.5 l-2.5 2.5`} className="stroke-muted-foreground" strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round" />
          <Line x={44} y={y + 2} w={[110, 90, 120, 80][i]} />
          {i < 3 && <Line x={24} y={y + 15} w={152} h={0.75} className={tone.faint} />}
        </g>
      ))}
    </Frame>
  );
}
