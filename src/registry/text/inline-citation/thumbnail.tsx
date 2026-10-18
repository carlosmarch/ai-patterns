import { Frame, Box, Line, tone } from "@/components/thumbnail";

export default function InlineCitationThumbnail() {
  return (
    <Frame>
      <Box x={76} y={14} w={86} h={34} r={6} />
      <Line x={86} y={24} w={60} className={tone.strong} />
      <Line x={86} y={34} w={44} h={3} />
      <Line x={24} y={64} w={150} />
      <Line x={24} y={76} w={90} />
      <Box x={116} y={73} w={8} h={8} r={2} className={tone.strong} />
      <Line x={128} y={76} w={46} />
      <Line x={24} y={88} w={120} />
    </Frame>
  );
}
