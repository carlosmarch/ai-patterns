import { Frame, Box, Button, Dot, Line, tone } from "@/components/thumbnail";

export default function PromptAutocompleteThumbnail() {
  return (
    <Frame>
      <Box x={30} y={30} w={140} h={60} r={10} />
      <Line x={42} y={42} w={40} className={tone.mid} />
      <Line x={85} y={42} w={2} h={6} className={tone.strong} />
      <Line x={90} y={42} w={68} className={tone.faint} />
      <Line x={42} y={52} w={52} className={tone.faint} />
      <Button x={40} y={73} w={30} h={9} outline />
      <Dot cx={158} cy={78} r={6} className={tone.strong} />
    </Frame>
  );
}
