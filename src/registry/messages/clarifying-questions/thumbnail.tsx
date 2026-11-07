import { Frame, Box, Button, Line, tone } from "@/components/thumbnail";

export default function ClarifyingQuestionsThumbnail() {
  return (
    <Frame>
      <Box x={110} y={10} w={60} h={12} r={6} className={tone.muted} />
      <Box x={30} y={28} w={140} h={84} r={8} />
      <Line x={40} y={37} w={90} />
      {[52, 72].map((y, row) => (
        <g key={y}>
          <Line x={40} y={y} w={30} h={3} className={tone.mid} />
          {[0, 1, 2].map((i) => (
            <Button key={i} x={40 + i * 30} y={y + 6} w={26} h={9} outline={i !== row} />
          ))}
        </g>
      ))}
      <Button x={138} y={96} w={24} h={10} />
    </Frame>
  );
}
