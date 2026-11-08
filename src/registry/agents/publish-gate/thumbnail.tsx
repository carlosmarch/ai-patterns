import { Frame, Box, Button, Dot, Line, tone } from "@/components/thumbnail";

// A target line, a list of checks (one failed, with its fix action), and a
// Publish button that stays outlined — locked — until everything passes.
export default function PublishGateThumbnail() {
  return (
    <Frame>
      <Box x={30} y={12} w={140} h={96} r={10} />
      <Line x={42} y={22} w={70} className={tone.mid} />
      <Line x={30} y={32} w={140} h={0.75} className={tone.faint} />
      {[42, 54, 80].map((y) => (
        <g key={y}>
          <Dot cx={44} cy={y + 2} r={3} className={tone.strong} />
          <Line x={52} y={y} w={y === 54 ? 60 : 76} />
        </g>
      ))}
      <Dot cx={44} cy={68} r={3} dashed className={tone.card} />
      <Line x={52} y={66} w={68} className={tone.mid} />
      <Box x={128} y={63} w={30} h={10} r={5} className={tone.muted} />
      <Line x={30} y={90} w={140} h={0.75} className={tone.faint} />
      <Button x={130} y={94} w={30} h={9} outline />
    </Frame>
  );
}
