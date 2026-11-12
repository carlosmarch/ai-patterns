import { Frame, Box, Button, Line, tone } from "@/components/thumbnail";

export default function ComposerQuestionThumbnail() {
  return (
    <Frame>
      <Box x={30} y={10} w={140} h={74} r={8} />
      <Line x={40} y={20} w={84} className={tone.mid} />
      {[32, 46, 60].map((y, i) => (
        <g key={y}>
          {i === 0 && <Box x={36} y={y - 3} w={128} h={12} r={4} className={tone.muted} />}
          <Box x={40} y={y - 1} w={8} h={8} r={2} className={i === 0 ? tone.card : tone.muted} />
          <Line x={54} y={y + 1} w={70 - i * 12} className={i === 0 ? tone.strong : tone.text} />
        </g>
      ))}
      <Line x={54} y={73} w={36} className={tone.faint} />
      <Button x={140} y={70} w={20} h={9} outline />
      <Box x={30} y={90} w={140} h={20} r={10} />
      <Line x={40} y={98} w={50} className={tone.faint} />
      <Button x={152} y={93} w={14} h={14} />
    </Frame>
  );
}
