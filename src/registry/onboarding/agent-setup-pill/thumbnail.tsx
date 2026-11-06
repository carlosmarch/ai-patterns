import { Frame, Box, Dot, Line, tone } from "@/components/thumbnail";

export default function AgentSetupPillThumbnail() {
  return (
    <Frame>
      <Box x={46} y={30} w={96} h={14} r={5} className={tone.muted} />
      <Line x={54} y={35} w={80} h={4} />
      <Box x={28} y={54} w={118} h={22} r={11} />
      <Line x={40} y={63} w={52} className={tone.strong} />
      <Dot cx={104} cy={65} r={3.5} className={tone.mid} />
      <Dot cx={114} cy={65} r={3.5} className={tone.mid} />
      <Dot cx={124} cy={65} r={3.5} className={tone.mid} />
      <Dot cx={134} cy={65} r={3.5} className={tone.mid} />
      <Box x={152} y={54} w={22} h={22} r={11} />
      <Line x={159} y={64} w={8} h={2} />
    </Frame>
  );
}
