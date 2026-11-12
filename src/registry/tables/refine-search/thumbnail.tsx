import { Frame, Box, Button, Dot, Line, tone } from "@/components/thumbnail";

export default function RefineSearchThumbnail() {
  return (
    <Frame>
      {/* Search field */}
      <Box x={16} y={12} w={168} h={14} r={4} />
      <Line x={23} y={17} w={52} className={tone.faint} />
      <Line x={170} y={12} w={0.75} h={14} className={tone.faint} />
      <Dot cx={177} cy={19} r={2.5} className={tone.text} />
      {/* Refine your search: header + proposal pills */}
      <Box x={16} y={32} w={168} h={34} r={5} className={tone.muted} />
      <Dot cx={24} cy={40} r={2} className={tone.mid} />
      <Line x={30} y={38} w={46} className={tone.strong} />
      <Button x={22} y={48} w={38} h={11} outline />
      <Line x={27} y={51.5} w={20} className={tone.mid} />
      <Line x={50} y={51.5} w={6} className={tone.faint} />
      <Button x={64} y={48} w={44} h={11} outline />
      <Line x={69} y={51.5} w={26} className={tone.mid} />
      <Line x={98} y={51.5} w={6} className={tone.faint} />
      {/* Result count + rows */}
      <Line x={16} y={73} w={70} className={tone.text} />
      {[84, 96, 108].map((y, i) => (
        <g key={y} opacity={i === 2 ? 0.4 : 1}>
          <Line x={16} y={y} w={[56, 44, 50][i]} className={tone.mid} />
          <Line x={100} y={y} w={30} className={tone.text} />
          <Line x={156} y={y} w={28} className={tone.faint} />
        </g>
      ))}
    </Frame>
  );
}
