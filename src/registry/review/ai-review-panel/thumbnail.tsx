import { Box, Button, Dot, Frame, Line, tone } from "@/components/thumbnail";

export default function AiReviewPanelThumbnail() {
  return (
    <Frame>
      {/* Source document, one passage highlighted */}
      {[22, 32, 42, 56, 66].map((y, i) => (
        <Line key={y} x={14} y={y} w={i === 2 ? 44 : 70} className={tone.faint} />
      ))}
      <Box x={30} y={30} w={40} h={8} r={2} className={tone.muted} />
      {/* Review panel: progress bar, tabs, one expanded field, collapsed fields, apply */}
      <Box x={98} y={8} w={94} h={104} r={8} />
      <Line x={106} y={15} w={24} h={3} className={tone.strong} />
      <Line x={106} y={23} w={24} h={2} className={tone.mid} />
      <Line x={131} y={23} w={18} h={2} className={tone.text} />
      <Line x={150} y={23} w={34} h={2} className={tone.faint} />
      <Box x={103} y={31} w={84} h={36} r={4} className={tone.muted} />
      <Dot cx={109} cy={37} r={1.5} className={tone.strong} />
      <Line x={113} y={35} w={30} className={tone.mid} />
      <Box x={107} y={43} w={76} h={18} r={3} />
      <Line x={111} y={48} w={1.5} h={9} className={tone.strong} />
      <Line x={115} y={48} w={52} h={3} className={tone.text} />
      <Line x={115} y={54} w={36} h={3} className={tone.text} />
      {[74, 84].map((y) => (
        <g key={y}>
          <Dot cx={109} cy={y + 2} r={1.5} className={tone.text} />
          <Line x={113} y={y} w={34} className={tone.faint} />
        </g>
      ))}
      <Button x={103} y={97} w={84} h={9} />
    </Frame>
  );
}
