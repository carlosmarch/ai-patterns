import { Frame, Box, Button, Line, tone } from "@/components/thumbnail";

export default function InstructionToolsThumbnail() {
  return (
    <Frame>
      <Box x={30} y={14} w={140} h={92} />
      <Line x={42} y={28} w={110} />
      <Line x={42} y={42} w={30} />
      <Button x={76} y={39} w={32} outline />
      <Line x={112} y={42} w={30} />
      <Box x={76} y={54} w={60} h={40} r={5} />
      <Box x={80} y={58} w={52} h={10} r={3} className={tone.muted} />
      <Line x={86} y={61} w={34} className={tone.strong} />
      <Line x={86} y={73} w={30} />
      <Line x={86} y={84} w={38} />
    </Frame>
  );
}
