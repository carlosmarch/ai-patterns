import { Frame, Box, Button, Dot, Line, tone } from "@/components/thumbnail";

export default function PromptEnhancerThumbnail() {
  return (
    <Frame>
      <Box x={30} y={20} w={140} h={66} r={10} />
      <Line x={42} y={32} w={24} />
      <Box x={68} y={30} w={56} h={8} r={2} className={tone.faint} />
      <Line x={70} y={32} w={52} className={tone.mid} />
      <Line x={42} y={44} w={18} />
      <Box x={62} y={42} w={78} h={8} r={2} className={tone.faint} />
      <Line x={64} y={44} w={74} className={tone.mid} />
      <Button x={40} y={70} w={34} h={10} outline />
      <Dot cx={158} cy={75} r={6} className={tone.strong} />
      <Line x={32} y={96} w={58} h={3} className={tone.faint} />
      <Line x={96} y={96} w={18} h={3} className={tone.strong} />
    </Frame>
  );
}
