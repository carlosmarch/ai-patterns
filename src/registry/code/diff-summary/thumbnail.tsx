import { Frame, Box, Button, Line, tone } from "@/components/thumbnail";

export default function DiffSummaryThumbnail() {
  return (
    <Frame>
      <Box x={30} y={16} w={140} h={88} r={8} />
      <Line x={42} y={27} w={50} className={tone.strong} />
      <Line x={98} y={27} w={12} className="fill-emerald-500" />
      <Line x={113} y={27} w={10} className="fill-red-500" />
      <Button x={136} y={24} w={24} outline />
      <Line x={30} y={40} w={140} h={0.75} className={tone.faint} />
      {[50, 64, 78].map((y, i) => (
        <g key={y}>
          <Box x={42} y={y} w={8} h={10} r={1.5} className={tone.muted} />
          <Line x={56} y={y + 3} w={60 - i * 10} />
          <Line x={140} y={y + 3} w={8} className="fill-emerald-500/70" />
          <Line x={150} y={y + 3} w={8} className="fill-red-500/70" />
        </g>
      ))}
      <Line x={42} y={94} w={36} h={3} className={tone.faint} />
    </Frame>
  );
}
