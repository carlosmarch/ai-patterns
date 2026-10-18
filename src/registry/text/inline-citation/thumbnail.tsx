import { Frame, Box, Line, tone } from "@/components/thumbnail";

export default function InlineCitationThumbnail() {
  return (
    <Frame>
      <Line x={20} y={64} w={150} />
      <Line x={20} y={76} w={90} />
      <Box x={112} y={72} w={10} h={8} r={2} className="fill-sky-500" />
      <Line x={126} y={76} w={44} />
      <Line x={20} y={88} w={130} />
      <Line x={20} y={100} w={100} />
      <Box x={70} y={12} w={100} h={48} r={8} />
      <Box x={80} y={22} w={10} h={10} r={3} className="fill-sky-500/30" />
      <Line x={96} y={23} w={50} h={3} />
      <Line x={80} y={38} w={78} className={tone.strong} />
      <Line x={80} y={47} w={60} h={3} />
      <path d="M113 60 l4 6 l4 -6" className="fill-card stroke-border" />
    </Frame>
  );
}
