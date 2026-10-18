import { Frame, Line, tone } from "@/components/thumbnail";

export default function FollowUpListThumbnail() {
  return (
    <Frame>
      {[24, 46, 68, 90].map((y, i) => (
        <g key={y}>
          <Line x={30} y={y} w={[110, 90, 120, 80][i]} />
          {i < 3 && <Line x={30} y={y + 12} w={140} h={0.75} className={tone.faint} />}
        </g>
      ))}
    </Frame>
  );
}
