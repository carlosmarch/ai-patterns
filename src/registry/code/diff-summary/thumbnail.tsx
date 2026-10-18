import { Frame, Box, Line, tone } from "@/components/thumbnail";

export default function DiffSummaryThumbnail() {
  return (
    <Frame>
      <Box x={36} y={20} w={128} h={80} r={8} />
      <Line x={48} y={32} w={50} className={tone.strong} />
      <Line x={36} y={44} w={128} h={0.75} className={tone.faint} />
      {[54, 68, 82].map((y, i) => (
        <g key={y}>
          <Line x={48} y={y} w={64 - i * 10} />
          <Line x={136} y={y} w={8} className={tone.mid} />
          <Line x={146} y={y} w={6} className={tone.faint} />
        </g>
      ))}
    </Frame>
  );
}
