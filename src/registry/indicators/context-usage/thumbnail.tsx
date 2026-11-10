import { Frame, Box, Line, Dot, tone } from "@/components/thumbnail";

export default function ContextUsageThumbnail() {
  return (
    <Frame>
      <Box x={30} y={12} w={140} h={96} r={10} />
      <Line x={42} y={23} w={30} h={4} className={tone.mid} />
      <Box x={130} y={20} w={28} h={10} r={5} className={tone.muted} />
      <Line x={42} y={36} w={40} h={9} className={tone.strong} />
      <Line x={136} y={40} w={22} h={3} className={tone.faint} />
      <Box x={42} y={52} w={44} h={5} r={2.5} className={tone.strong} />
      <Box x={88} y={52} w={20} h={5} r={2.5} className={tone.mid} />
      <Box x={110} y={52} w={8} h={5} r={2.5} className={tone.text} />
      <Box x={120} y={52} w={22} h={5} r={2.5} className={tone.muted} />
      <Box x={144} y={52} w={14} h={5} r={2.5} className={tone.text} />
      <Dot cx={45} cy={68} r={2.5} className={tone.strong} />
      <Line x={52} y={66} w={34} h={3} className={tone.mid} />
      <Line x={138} y={66} w={20} h={3} className={tone.faint} />
      <Dot cx={45} cy={79} r={2.5} className={tone.mid} />
      <Line x={52} y={77} w={26} h={3} className={tone.mid} />
      <Line x={138} y={77} w={20} h={3} className={tone.faint} />
      <Dot cx={45} cy={90} r={2.5} className={tone.text} />
      <Line x={52} y={88} w={30} h={3} className={tone.mid} />
      <Line x={138} y={88} w={20} h={3} className={tone.faint} />
    </Frame>
  );
}
