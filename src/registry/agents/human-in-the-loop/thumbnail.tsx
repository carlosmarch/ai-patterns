import { Frame, Box, Button, Dot, Line, tone } from "@/components/thumbnail";

export default function HumanInTheLoopThumbnail() {
  return (
    <Frame>
      <Box x={44} y={14} w={112} h={92} />
      <Line x={56} y={26} w={70} className={tone.strong} />
      {[42, 56, 70].map((y, i) => (
        <g key={y}>
          <Dot cx={60} cy={y + 2} r={3} className={i === 0 ? tone.strong : tone.card} />
          <Line x={68} y={y} w={56 - i * 8} />
        </g>
      ))}
      <Button x={116} y={88} w={28} />
    </Frame>
  );
}
