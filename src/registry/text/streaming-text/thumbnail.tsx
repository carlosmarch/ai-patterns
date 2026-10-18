import { Frame, Box, Line, tone } from "@/components/thumbnail";

export default function StreamingTextThumbnail() {
  return (
    <Frame>
      <Line x={30} y={26} w={140} />
      <Line x={30} y={38} w={130} />
      <Line x={30} y={50} w={136} />
      <Line x={30} y={62} w={110} />
      <Line x={30} y={74} w={70} />
      <Box x={103} y={72} w={3} h={8} r={1} className={tone.strong} />
    </Frame>
  );
}
