import { Frame, Box, Button, Dot, Line, tone } from "@/components/thumbnail";

export default function IncognitoToggleThumbnail() {
  return (
    <Frame>
      <Line x={30} y={18} w={36} className={tone.strong} />
      <Button x={124} y={14} w={46} h={12} />
      <Box x={30} y={36} w={140} h={28} r={8} className={tone.muted} dashed />
      <Dot cx={44} cy={50} r={5} className={tone.strong} />
      <Line x={56} y={45} w={40} className={tone.mid} />
      <Line x={56} y={53} w={90} h={3} className={tone.faint} />
      <Box x={30} y={74} w={140} h={32} r={9} dashed />
      <Line x={40} y={84} w={56} className={tone.text} />
      <Dot cx={158} cy={96} r={6} className={tone.strong} />
    </Frame>
  );
}
