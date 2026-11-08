import { Frame, Box, Dot, Line, tone } from "@/components/thumbnail";

// A reason card sits on top of the composer, which holds the restored text
// — the person's words come back instead of a failed session.
export default function RejectedPromptRestoreThumbnail() {
  return (
    <Frame>
      <Box x={30} y={22} w={140} h={32} r={8} className={tone.muted} />
      <Dot cx={42} cy={32} r={3} dashed className={tone.card} />
      <Line x={50} y={30} w={64} className={tone.mid} />
      <Line x={50} y={40} w={92} />
      <Box x={30} y={62} w={140} h={36} r={10} className="fill-card stroke-muted-foreground/60" />
      <Line x={42} y={72} w={98} className={tone.mid} />
      <Line x={42} y={82} w={70} className={tone.mid} />
      <Dot cx={156} cy={86} r={6} className={tone.strong} />
    </Frame>
  );
}
