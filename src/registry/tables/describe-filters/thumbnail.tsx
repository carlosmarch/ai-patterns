import { Frame, Box, Button, Dot, Line, tone } from "@/components/thumbnail";

export default function DescribeFiltersThumbnail() {
  return (
    <Frame>
      <Box x={16} y={14} w={168} h={92} r={8} />
      {/* Toolbar: describe button, search, one generated chip */}
      <Button x={24} y={22} w={34} h={11} outline />
      <Line x={32} y={25.5} w={20} className={tone.strong} />
      <Button x={62} y={22} w={36} h={11} outline />
      <Line x={68} y={25.5} w={18} className={tone.faint} />
      <Box x={104} y={22} w={60} h={11} r={5.5} className={tone.muted} dashed />
      <Line x={110} y={25.5} w={40} className={tone.mid} />
      <Line x={16} y={39} w={168} h={0.75} className={tone.faint} />
      {/* Rows */}
      {[48, 62, 76, 90].map((y, i) => (
        <g key={y} opacity={i < 2 ? 1 : 0.35}>
          <Dot cx={28} cy={y + 2} r={2} className={tone.faint} />
          <Line x={36} y={y} w={[46, 38, 42, 34][i]} className={i < 2 ? tone.mid : tone.text} />
          <Line x={100} y={y} w={26} className={tone.text} />
          <Line x={140} y={y} w={30} className={tone.faint} />
        </g>
      ))}
    </Frame>
  );
}
