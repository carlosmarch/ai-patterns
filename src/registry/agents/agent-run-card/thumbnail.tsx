import { Frame, Box, Dot, Line, tone } from "@/components/thumbnail";

export default function AgentRunCardThumbnail() {
  return (
    <Frame>
      <Box x={36} y={14} w={128} h={92} r={8} />
      {/* Title + timer */}
      <Dot cx={46} cy={24} r={2.5} className={tone.mid} />
      <Line x={52} y={22} w={50} h={3} />
      <Line x={138} y={22} w={16} h={3} className={tone.mid} />
      {/* Current step */}
      <Line x={44} y={32} w={76} h={5} className={tone.strong} />
      {/* Segmented progress */}
      <Line x={44} y={44} w={20} h={3} className={tone.mid} />
      <Line x={66} y={44} w={20} h={3} className={tone.mid} />
      <Line x={88} y={44} w={20} h={3} className={tone.mid} />
      <Line x={110} y={44} w={20} h={3} className={tone.faint} />
      <Line x={110} y={44} w={9} h={3} className={tone.text} />
      <Line x={132} y={44} w={22} h={3} className={tone.faint} />
      {/* Divider */}
      <rect x={36} y={55} width={128} height={0.75} className="fill-border" />
      {/* Finished steps, newest first */}
      <Dot cx={47} cy={67} r={3} className={tone.mid} />
      <Line x={55} y={65} w={58} />
      <Line x={140} y={65} w={14} className={tone.faint} />
      <Dot cx={47} cy={80} r={3} className={tone.mid} />
      <Line x={55} y={78} w={44} />
      <Line x={140} y={78} w={14} className={tone.faint} />
      <Dot cx={47} cy={93} r={3} className={tone.mid} />
      <Line x={55} y={91} w={52} />
      <Line x={140} y={91} w={14} className={tone.faint} />
    </Frame>
  );
}
