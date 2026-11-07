import { Frame, Box, Dot, Line, tone } from "@/components/thumbnail";

export default function ConversationBranchesThumbnail() {
  return (
    <Frame>
      <Box x={92} y={16} w={78} h={18} r={9} className={tone.muted} />
      <Line x={102} y={23} w={56} className={tone.mid} />
      <Dot cx={130} cy={44} r={2} className={tone.text} />
      <Line x={136} y={42} w={14} h={4} className={tone.strong} />
      <Dot cx={158} cy={44} r={2} className={tone.text} />
      <Line x={30} y={60} w={120} />
      <Line x={30} y={70} w={104} />
      <Line x={30} y={80} w={70} />
      <Box x={30} y={94} w={10} h={10} r={5} dashed className={tone.card} />
    </Frame>
  );
}
