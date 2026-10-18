import { Frame, Box, Line, tone } from "@/components/thumbnail";

export default function SelectionActionsThumbnail() {
  return (
    <Frame>
      <Box x={60} y={26} w={80} h={18} r={9} className="fill-foreground stroke-foreground" />
      <Line x={70} y={33} w={16} className="fill-background/60" />
      <Line x={92} y={33} w={16} className="fill-background/60" />
      <Line x={114} y={33} w={16} className="fill-background/60" />
      <Line x={24} y={58} w={150} />
      <Line x={24} y={70} w={36} />
      <rect x={62} y={67} width={76} height={10} rx={2} className="fill-muted-foreground/20" />
      <Line x={64} y={70} w={72} className={tone.mid} />
      <Line x={142} y={70} w={32} />
      <Line x={24} y={82} w={120} />
    </Frame>
  );
}
