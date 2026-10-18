import { Frame, Box, Button, Line, tone } from "@/components/thumbnail";

export default function StreamingTextThumbnail() {
  return (
    <Frame>
      <Line x={28} y={18} w={144} />
      <Line x={28} y={28} w={130} />
      <Box x={160} y={27} w={10} h={6} r={3} className={tone.muted} />
      <Line x={28} y={38} w={140} />
      <Line x={28} y={48} w={96} />
      <Line x={28} y={62} w={136} />
      <Line x={28} y={72} w={70} />
      <Box x={101} y={70} w={2.5} h={8} r={1} className="fill-sky-500" />
      {[0, 1, 2, 3].map((i) => (
        <Box key={i} x={28 + i * 12} y={88} w={8} h={8} r={2} className={tone.faint} />
      ))}
      <Button x={28} y={102} w={60} h={8} outline />
      <Button x={92} y={102} w={48} h={8} outline />
    </Frame>
  );
}
