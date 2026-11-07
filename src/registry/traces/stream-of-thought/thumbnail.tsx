import { Frame, Line, tone } from "@/components/thumbnail";

export default function StreamOfThoughtThumbnail() {
  return (
    <Frame>
      <Line x={40} y={18} w={48} className={tone.mid} />
      <Line x={42} y={30} w={1.5} h={58} className={tone.faint} />
      <Line x={52} y={32} w={60} className={tone.faint} />
      <Line x={52} y={40} w={96} className={tone.faint} />
      <Line x={52} y={54} w={52} className={tone.mid} />
      <Line x={52} y={62} w={104} />
      <Line x={52} y={70} w={88} />
      <Line x={52} y={78} w={46} />
      <Line x={40} y={98} w={120} className={tone.strong} />
    </Frame>
  );
}
