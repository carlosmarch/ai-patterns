import { Frame, Box, Button, Dot, Line, tone } from "@/components/thumbnail";

export default function CriteriaDeterminationThumbnail() {
  return (
    <Frame>
      {/* Determination select */}
      <Box x={30} y={14} w={140} h={14} r={4} />
      <Dot cx={38} cy={21} r={2.5} className={tone.mid} />
      <Line x={44} y={19} w={34} />
      <Button x={146} y={17} w={16} h={8} className={tone.faint} />

      {/* Missing information card with Yes / No */}
      <Box x={30} y={36} w={140} h={32} r={5} className={tone.muted} />
      <Line x={38} y={42} w={92} className={tone.mid} />
      <Line x={38} y={50} w={30} h={3} />
      <Button x={38} y={57} w={16} h={7} outline />
      <Button x={57} y={57} w={16} h={7} outline />

      {/* Resolved rows */}
      {[76, 92].map((y) => (
        <g key={y}>
          <Box x={30} y={y} w={140} h={12} r={4} className={tone.faint} />
          <Line x={38} y={y + 4} w={18} h={3} />
          <Line x={64} y={y + 4} w={84} h={3} className={tone.mid} />
        </g>
      ))}
    </Frame>
  );
}
