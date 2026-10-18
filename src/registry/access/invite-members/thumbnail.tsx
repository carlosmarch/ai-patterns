import { Frame, Box, Button, Dot, Line, tone } from "@/components/thumbnail";

export default function InviteMembersThumbnail() {
  return (
    <Frame>
      <Box x={32} y={14} w={136} h={92} r={10} />
      <Box x={44} y={26} w={84} h={14} r={4} />
      <Button x={132} y={26} w={24} h={14} />
      {[54, 70, 86].map((y, i) => (
        <g key={y}>
          <Dot cx={50} cy={y + 2} r={4} className={tone.muted} />
          <Line x={60} y={y} w={50 - i * 6} />
          <Button x={128} y={y - 3} w={28} h={10} outline />
        </g>
      ))}
    </Frame>
  );
}
