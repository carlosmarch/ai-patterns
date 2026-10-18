import { Frame, Box, Dot, Line, tone } from "@/components/thumbnail";

export default function PromptOnboardingThumbnail() {
  return (
    <Frame>
      <Box x={32} y={14} w={136} h={92} r={10} />
      <Line x={44} y={26} w={70} className={tone.strong} />
      <Box x={44} y={38} w={112} h={34} r={5} className={tone.muted} />
      <Line x={52} y={46} w={84} h={3} />
      <Line x={52} y={54} w={70} h={3} />
      <Line x={52} y={62} w={50} h={3} />
      <Dot cx={48} cy={90} r={3} className={tone.strong} />
      <Line x={58} y={88} w={56} />
    </Frame>
  );
}
