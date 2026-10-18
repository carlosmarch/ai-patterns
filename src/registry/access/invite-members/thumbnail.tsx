import { Frame, Box, Button, Dot, Line, tone } from "@/components/thumbnail";

export default function InviteMembersThumbnail() {
  return (
    <Frame>
      <Box x={26} y={10} w={148} h={100} r={10} />
      <Line x={38} y={20} w={56} className={tone.strong} />
      <Box x={38} y={32} w={78} h={14} r={4} />
      <Line x={44} y={37} w={44} className={tone.faint} />
      <Box x={120} y={32} w={20} h={14} r={4} />
      <Button x={144} y={32} w={20} h={14} />
      {[58, 76, 94].map((y, i) => (
        <g key={y}>
          <Dot cx={44} cy={y + 4} r={5} className={["fill-violet-500", "fill-sky-500", "fill-amber-500"][i]} />
          <Line x={54} y={y} w={46 - i * 6} className={tone.strong} />
          <Line x={54} y={y + 6} w={60} h={3} />
          <Button x={134} y={y - 1} w={30} h={11} outline />
        </g>
      ))}
    </Frame>
  );
}
