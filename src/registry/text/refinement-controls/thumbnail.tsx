import { Frame, Box, Button, Dot, Line, tone } from "@/components/thumbnail";

export default function RefinementControlsThumbnail() {
  return (
    <Frame>
      <Box x={20} y={10} w={160} h={54} r={8} />
      <Line x={30} y={20} w={136} />
      <Line x={30} y={30} w={128} />
      <Line x={30} y={40} w={90} />
      <path d="M140 52 l-2 2 l2 2 M156 52 l2 2 l-2 2" className="stroke-muted-foreground" strokeWidth={1} />
      <Line x={143} y={53} w={10} h={2} />
      <Button x={20} y={72} w={34} outline />
      <Button x={58} y={72} w={30} outline />
      <Button x={92} y={72} w={42} outline />
      <Button x={138} y={72} w={38} outline />
      <Box x={20} y={90} w={160} h={18} r={9} />
      <Line x={30} y={97} w={70} className={tone.faint} />
      <Dot cx={170} cy={99} r={5} className={tone.strong} />
    </Frame>
  );
}
