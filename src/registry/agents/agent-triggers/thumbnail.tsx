import { Frame, Box, Dot, Line, tone } from "@/components/thumbnail";

export default function AgentTriggersThumbnail() {
  return (
    <Frame>
      <Box x={44} y={16} w={112} h={88} />
      {[30, 52, 74].map((y, i) => (
        <g key={y}>
          <Line x={56} y={y + 2} w={50 - i * 8} />
          <Box x={124} y={y} w={20} h={8} r={4} className={i === 1 ? tone.faint : tone.strong} />
          <Dot cx={i === 1 ? 128 : 140} cy={y + 4} r={2.5} className="fill-background" />
        </g>
      ))}
    </Frame>
  );
}
