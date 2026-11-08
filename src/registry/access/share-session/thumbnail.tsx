import { Frame, Box, Dot, Line, tone } from "@/components/thumbnail";

// A small dialog: two visibility options (the first selected), a policy
// line and a warning box at the bottom.
export default function ShareSessionThumbnail() {
  return (
    <Frame>
      <Box x={36} y={10} w={128} h={100} r={8} />
      <Line x={46} y={19} w={48} className={tone.strong} />
      <Line x={46} y={28} w={78} h={3} />
      <Box x={44} y={37} w={112} h={18} r={4} className="fill-muted stroke-none" />
      <Dot cx={52} cy={46} r={3} className={tone.mid} />
      <Line x={60} y={41.5} w={30} h={3} className={tone.mid} />
      <Line x={60} y={47.5} w={46} h={3} />
      <Dot cx={148} cy={46} r={2.5} className={tone.strong} />
      <Dot cx={52} cy={64} r={3} className={tone.mid} />
      <Line x={60} y={59.5} w={26} h={3} className={tone.mid} />
      <Line x={60} y={65.5} w={56} h={3} />
      <Line x={46} y={76} w={96} h={3} className={tone.faint} />
      <Box x={44} y={84} w={112} h={18} r={4} />
      <Dot cx={52} cy={93} r={3} className={tone.strong} />
      <Line x={60} y={88.5} w={86} h={3} className={tone.mid} />
      <Line x={60} y={94.5} w={60} h={3} />
    </Frame>
  );
}
