import { Frame, Box, Dot, Line, tone } from "@/components/thumbnail";

export default function PromptOnboardingThumbnail() {
  return (
    <Frame>
      <Box x={24} y={10} w={152} h={100} r={10} />
      <Line x={36} y={20} w={70} className={tone.strong} />
      <Line x={36} y={29} w={100} h={3} />
      <Box x={36} y={40} w={128} h={38} r={5} className={tone.muted} />
      <Line x={44} y={47} w={96} h={3} className="fill-muted-foreground/50" />
      <Line x={44} y={55} w={80} h={3} className="fill-muted-foreground/50" />
      <Line x={44} y={63} w={60} h={3} className="fill-muted-foreground/50" />
      <Box x={144} y={45} w={14} h={12} r={3} />
      <Box x={148} y={48} w={6} h={6} r={1} className="stroke-muted-foreground" />
      <Dot cx={42} cy={94} r={6} className="fill-emerald-500/20" />
      <Dot cx={42} cy={94} r={3} className="fill-emerald-500" />
      <Line x={52} y={92} w={64} />
    </Frame>
  );
}
