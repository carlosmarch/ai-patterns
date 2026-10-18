import { Frame, Box, Line, tone } from "@/components/thumbnail";

export default function TriggerConditionThumbnail() {
  return (
    <Frame>
      <defs>
        <pattern id="flow-dots" width="8" height="8" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="0.7" className="fill-muted-foreground/30" />
        </pattern>
      </defs>
      <rect width={200} height={120} fill="url(#flow-dots)" />
      <Box x={66} y={18} w={68} h={24} />
      <Line x={78} y={28} w={40} className={tone.strong} />
      <path d="M100 42 V78" className="stroke-muted-foreground/50" strokeWidth={1.2} />
      <Box x={66} y={78} w={68} h={24} />
      <Line x={78} y={88} w={34} />
    </Frame>
  );
}
