import { Frame, Box, Button, Dot, Line, tone } from "@/components/thumbnail";

// Top: the working agent's run strip. Middle: spoken lines, with a hand-off
// marked apart. Bottom: the call bar — a waveform, mute and end.
const BARS = [4, 8, 14, 10, 18, 12, 6, 16, 9, 5, 11, 7];

export default function VoiceAgentRelayThumbnail() {
  return (
    <Frame>
      <Box x={30} y={12} w={140} h={96} r={10} />
      <Line x={30} y={28} w={140} h={0.75} className={tone.faint} />
      <Dot cx={42} cy={20} r={2.5} dashed className={tone.card} />
      <Line x={50} y={18} w={56} className={tone.mid} />
      <Line x={42} y={38} w={92} className={tone.mid} />
      <Line x={42} y={48} w={70} />
      <Dot cx={44} cy={60} r={2} className={tone.text} />
      <Line x={50} y={58} w={64} h={3} />
      <Line x={42} y={68} w={84} className={tone.mid} />
      <Line x={30} y={82} w={140} h={0.75} className={tone.faint} />
      {BARS.map((h, i) => (
        <rect key={i} x={50 + i * 5} y={95 - h / 2} width={2.5} height={h} rx={1.25} className={tone.strong} />
      ))}
      <Dot cx={126} cy={95} r={5} className={tone.card} />
      <Button x={136} y={90} w={26} />
    </Frame>
  );
}
