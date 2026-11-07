import { Frame, Box, Button, Dot, Line, tone } from "@/components/thumbnail";

export default function PlanReviewThumbnail() {
  return (
    <Frame>
      <Box x={36} y={12} w={128} h={96} r={8} />
      <Line x={48} y={22} w={48} className={tone.strong} />
      {[38, 52, 66].map((y, i) => (
        <g key={y}>
          <Box x={46} y={y - 4} w={108} h={12} r={4} className={i === 1 ? tone.muted : "fill-transparent stroke-transparent"} />
          <Line x={50} y={y} w={3} h={4} className={tone.faint} />
          <Dot cx={60} cy={y + 2} r={3.5} className={tone.card} />
          <Line x={68} y={y} w={[64, 52, 70][i]} />
        </g>
      ))}
      <Line x={48} y={92} w={26} h={3} className={tone.mid} />
      <Button x={122} y={88} w={32} h={11} />
    </Frame>
  );
}
