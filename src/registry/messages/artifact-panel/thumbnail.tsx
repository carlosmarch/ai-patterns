import { Frame, Box, Line, tone } from "@/components/thumbnail";

export default function ArtifactPanelThumbnail() {
  return (
    <Frame>
      <Box x={14} y={12} w={172} h={96} r={8} />
      <Box x={24} y={22} w={56} h={10} r={5} className={tone.muted} />
      <Line x={24} y={40} w={52} />
      <Line x={24} y={48} w={40} />
      <Box x={24} y={58} w={60} h={18} r={5} className={tone.muted} />
      <Line x={30} y={65} w={30} className={tone.mid} />
      <Box x={24} y={88} w={66} h={12} r={6} />
      <rect x={98} y={12} width={0.75} height={96} className="fill-border" />
      <Line x={108} y={22} w={44} className={tone.strong} />
      <Line x={108} y={38} w={64} />
      <Line x={108} y={46} w={70} />
      <Line x={108} y={54} w={58} />
      <Line x={108} y={66} w={66} />
      <Line x={108} y={74} w={48} />
    </Frame>
  );
}
