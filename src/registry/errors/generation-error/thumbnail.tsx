import { Frame, Box, Button, Dot, Line, tone } from "@/components/thumbnail";

export default function GenerationErrorThumbnail() {
  return (
    <Frame>
      <Box x={30} y={14} w={140} h={92} r={8} />
      <Dot cx={44} cy={27} r={4} className="fill-red-500" />
      <Line x={53} y={25} w={60} className={tone.strong} />
      <Line x={30} y={38} w={140} h={0.75} className={tone.faint} />
      <Box x={40} y={46} w={120} h={30} r={4} className={tone.muted} />
      <Line x={46} y={52} w={90} h={3} className="fill-red-500/60" />
      <Line x={46} y={60} w={70} h={3} className="fill-muted-foreground/50" />
      <Line x={46} y={68} w={100} h={3} className="fill-muted-foreground/50" />
      <Button x={92} y={86} w={30} outline />
      <Button x={126} y={86} w={34} />
    </Frame>
  );
}
