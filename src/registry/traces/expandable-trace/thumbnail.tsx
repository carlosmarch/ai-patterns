import { Frame, Line, tone } from "@/components/thumbnail";

export default function ExpandableTraceThumbnail() {
  return (
    <Frame>
      <Line x={40} y={22} w={70} className={tone.strong} />
      <Line x={42} y={36} w={1.5} h={62} className={tone.faint} />
      {[38, 54, 70, 86].map((y, i) => (
        <g key={y}>
          <Line x={52} y={y} w={[100, 70, 90, 60][i]} />
        </g>
      ))}
    </Frame>
  );
}
