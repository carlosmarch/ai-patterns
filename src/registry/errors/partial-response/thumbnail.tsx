import { Frame, Box, Button, Dot, Line, tone } from "@/components/thumbnail";

export default function PartialResponseThumbnail() {
  return (
    <Frame>
      <defs>
        <linearGradient id="partial-fade" x1="0" x2="1">
          <stop offset="0" stopColor="white" />
          <stop offset="1" stopColor="white" stopOpacity="0" />
        </linearGradient>
        <mask id="partial-mask">
          <rect x={20} y={46} width={120} height={8} fill="url(#partial-fade)" />
        </mask>
      </defs>
      <Line x={20} y={18} w={150} />
      <Line x={20} y={30} w={140} />
      <rect x={20} y={48} width={120} height={4} rx={2} className={tone.text} mask="url(#partial-mask)" />
      <Line x={20} y={40} w={150} />
      <Box x={20} y={64} w={160} h={20} r={6} className="fill-amber-500/10 stroke-amber-500/40" />
      <Dot cx={32} cy={74} r={3} className="fill-amber-500" />
      <Line x={40} y={72} w={80} className="fill-amber-700/50 dark:fill-amber-300/50" />
      <Button x={20} y={94} w={42} h={12} />
      <Button x={66} y={94} w={34} h={12} outline />
    </Frame>
  );
}
