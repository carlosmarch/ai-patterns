import { Frame, Box, Dot, Line, tone } from "@/components/thumbnail";

export default function PromptBarThumbnail() {
  return (
    <Frame>
      <Box x={24} y={40} w={152} h={40} r={20} />
      <Line x={42} y={58} w={80} />
      <Dot cx={156} cy={60} r={8} className={tone.strong} />
    </Frame>
  );
}
