import { Frame, Box, Line, tone } from "@/components/thumbnail";

export default function ConsoleErrorCardThumbnail() {
  return (
    <Frame>
      <Box x={30} y={14} w={140} h={92} r={8} className="fill-card stroke-foreground/40" />
      <Line x={42} y={26} w={60} className={tone.strong} />
      <Box x={42} y={38} w={116} h={34} r={4} className={tone.muted} />
      <Line x={48} y={45} w={70} h={3} />
      <rect x={43} y={51.5} width={114} height={8} className="fill-muted-foreground/20" />
      <Line x={48} y={54} w={86} h={3} className={tone.strong} />
      <Line x={48} y={63} w={56} h={3} />
      <Line x={42} y={82} w={80} h={3} />
      <Line x={42} y={92} w={60} h={3} className={tone.faint} />
    </Frame>
  );
}
