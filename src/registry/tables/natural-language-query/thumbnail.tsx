import { Frame, Box, Line, tone } from "@/components/thumbnail";

export default function NaturalLanguageQueryThumbnail() {
  return (
    <Frame>
      <Box x={16} y={12} w={168} h={96} r={8} />
      {/* Query bar: mode badge + SQL tokens */}
      <Box x={24} y={20} w={152} h={14} r={5} className={tone.card} />
      <Box x={27} y={23} w={18} h={8} r={3} className={tone.muted} />
      <Line x={50} y={25} w={20} className={tone.strong} />
      <Line x={73} y={25} w={8} className={tone.faint} />
      <Line x={84} y={25} w={30} className={tone.mid} />
      <Line x={117} y={25} w={14} className={tone.faint} />
      <Line x={26} y={40} w={60} h={3} className={tone.faint} />
      <Line x={16} y={49} w={168} h={0.75} className={tone.faint} />
      {/* Result rows */}
      {[58, 72, 86].map((y, i) => (
        <g key={y}>
          <Line x={28} y={y} w={[40, 34, 44][i]} className={tone.mid} />
          <Line x={96} y={y} w={30} className={tone.text} />
          <Line x={146} y={y} w={22} className={tone.faint} />
        </g>
      ))}
    </Frame>
  );
}
