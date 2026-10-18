import { Frame, Box, Dot, Line, tone } from "@/components/thumbnail";

export default function TriggerConditionThumbnail() {
  return (
    <Frame>
      <defs>
        <pattern id="flow-dots" width="8" height="8" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="0.7" className="fill-muted-foreground/30" />
        </pattern>
      </defs>
      <rect width={200} height={120} fill="url(#flow-dots)" />
      <Box x={60} y={14} w={80} h={30} />
      <Box x={68} y={22} w={14} h={14} r={4} className="fill-amber-500" />
      <Line x={88} y={24} w={40} className={tone.strong} />
      <Line x={88} y={32} w={28} h={3} />
      <path d="M100 44 V72" className="stroke-muted-foreground/50" strokeWidth={1.2} />
      <Dot cx={100} cy={58} r={4} className={tone.card} />
      <path d="M100 56 V60 M98 58 H102" className="stroke-muted-foreground" />
      <Box x={60} y={72} w={80} h={30} />
      <Box x={68} y={80} w={14} h={14} r={4} className="fill-sky-500" />
      <Line x={88} y={82} w={36} className={tone.strong} />
      <Line x={88} y={90} w={24} h={3} />
    </Frame>
  );
}
