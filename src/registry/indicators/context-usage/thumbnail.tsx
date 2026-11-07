import { Frame, Box, Line, Dot, tone } from "@/components/thumbnail";

export default function ContextUsageThumbnail() {
  return (
    <Frame>
      <Box x={30} y={16} w={140} h={88} r={10} />
      <Line x={42} y={28} w={30} h={4} className={tone.mid} />
      <Box x={130} y={25} w={28} h={10} r={5} className={tone.muted} />
      <Line x={42} y={42} w={44} h={9} className={tone.strong} />
      <Line x={90} y={46} w={20} h={3} className={tone.faint} />
      <Box x={42} y={60} w={50} h={14} r={3} className={tone.strong} />
      <Box x={94} y={60} w={24} h={14} r={3} className={tone.mid} />
      <Box x={120} y={60} w={10} h={14} r={3} className={tone.text} />
      <Box x={132} y={60} w={26} h={14} r={3} className={tone.muted} />
      <Box x={42} y={82} w={30} h={10} r={5} className={tone.muted} />
      <Dot cx={48} cy={87} r={2} className={tone.strong} />
      <Box x={76} y={82} w={30} h={10} r={5} className={tone.muted} />
      <Dot cx={82} cy={87} r={2} className={tone.mid} />
      <Box x={110} y={82} w={30} h={10} r={5} className={tone.muted} />
      <Dot cx={116} cy={87} r={2} className={tone.text} />
    </Frame>
  );
}
