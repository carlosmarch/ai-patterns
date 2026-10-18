import { Frame, Box, Line, tone } from "@/components/thumbnail";

export default function ChatBubbleThumbnail() {
  return (
    <Frame>
      <Box x={100} y={18} w={76} h={20} r={10} className={tone.strong} />
      <Line x={24} y={52} w={136} />
      <Line x={24} y={64} w={110} />
      {[0, 1, 2].map((i) => (
        <Box key={i} x={24 + i * 12} y={80} w={8} h={8} r={2} className={tone.faint} />
      ))}
    </Frame>
  );
}
