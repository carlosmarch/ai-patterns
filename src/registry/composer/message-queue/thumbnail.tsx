import { Frame, Box, Line, Dot, tone } from "@/components/thumbnail";

export default function MessageQueueThumbnail() {
  return (
    <Frame>
      {/* Queued message chips stacked above the composer */}
      <Box x={36} y={32} w={128} h={16} r={5} className={tone.muted} />
      <Line x={44} y={38} w={50} />
      <Dot cx={130} cy={40} r={2} className={tone.mid} />
      <Dot cx={140} cy={40} r={2} className={tone.mid} />
      <Dot cx={150} cy={40} r={2} className={tone.mid} />
      <Box x={36} y={52} w={128} h={16} r={5} className={tone.muted} />
      <Line x={44} y={58} w={36} />
      <Dot cx={130} cy={60} r={2} className={tone.mid} />
      <Dot cx={140} cy={60} r={2} className={tone.mid} />
      <Dot cx={150} cy={60} r={2} className={tone.mid} />
      {/* Composer with stop button */}
      <Box x={28} y={74} w={144} h={24} r={8} />
      <Line x={38} y={84} w={60} className={tone.faint} />
      <Box x={152} y={80} w={12} h={12} r={6} className={tone.strong} />
    </Frame>
  );
}
