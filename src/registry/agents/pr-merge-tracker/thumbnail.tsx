import { Frame, Box, Dot, Line, tone } from "@/components/thumbnail";

// A PR header with its status pill, a list of required checks (one still
// running, dashed), and a footer with the "merge when ready" switch on.
export default function PrMergeTrackerThumbnail() {
  return (
    <Frame>
      <Box x={30} y={12} w={140} h={96} r={10} />
      <Dot cx={44} cy={24} r={5} className={tone.muted} />
      <Line x={54} y={20} w={66} className={tone.strong} />
      <Line x={54} y={27} w={44} h={3} />
      <Box x={138} y={19} w={22} h={9} r={4.5} className={tone.muted} />
      <Line x={30} y={36} w={140} h={0.75} className={tone.faint} />
      {[44, 56, 68].map((y) => (
        <g key={y}>
          <Dot cx={44} cy={y + 2} r={3} className={y === 68 ? tone.card : tone.strong} dashed={y === 68} />
          <Line x={52} y={y} w={y === 56 ? 58 : 74} className={y === 68 ? tone.mid : tone.text} />
        </g>
      ))}
      <Line x={30} y={82} w={140} h={0.75} className={tone.faint} />
      <Box x={40} y={90} w={16} h={9} r={4.5} className={tone.muted} />
      <Dot cx={51.5} cy={94.5} r={3} className={tone.strong} />
      <Line x={62} y={93} w={44} />
    </Frame>
  );
}
