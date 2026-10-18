import { Frame, Box, Button, Dot, Line, tone } from "@/components/thumbnail";

export default function AgentTriggersThumbnail() {
  return (
    <Frame>
      <Box x={36} y={12} w={128} h={96} />
      <Line x={48} y={22} w={44} className={tone.strong} />
      <Button x={128} y={19} w={24} />
      {[38, 56, 74].map((y, i) => (
        <g key={y}>
          <Box x={48} y={y} w={12} h={12} r={3} className={tone.muted} />
          <Line x={66} y={y + 2} w={44 - i * 6} className={tone.strong} />
          <Line x={66} y={y + 8} w={30} h={3} />
          <Box x={136} y={y + 2} w={16} h={8} r={4} className={i === 1 ? tone.faint : "fill-emerald-500"} />
          <Dot cx={i === 1 ? 140 : 148} cy={y + 6} r={3} className="fill-background" />
        </g>
      ))}
      <Line x={48} y={96} w={60} h={3} className={tone.faint} />
    </Frame>
  );
}
