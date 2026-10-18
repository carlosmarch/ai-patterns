import { Frame, Box, Dot, Line, tone } from "@/components/thumbnail";

export default function StopGenerationButtonThumbnail() {
  return (
    <Frame>
      <Line x={24} y={22} w={140} />
      <Line x={24} y={34} w={100} />
      <Box x={24} y={56} w={152} h={40} r={20} />
      <Line x={42} y={74} w={70} className={tone.faint} />
      <Dot cx={156} cy={76} r={8} className={tone.strong} />
      <Box x={153} y={73} w={6} h={6} r={1} className="fill-background" />
    </Frame>
  );
}
