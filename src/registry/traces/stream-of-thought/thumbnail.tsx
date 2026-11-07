import { Dot, Frame, Line, tone } from "@/components/thumbnail";

export default function StreamOfThoughtThumbnail() {
  return (
    <Frame>
      <Line x={40} y={16} w={56} className={tone.mid} />
      <Line x={146} y={16} w={14} className={tone.mid} />
      <Line x={43.25} y={36} w={1.5} h={42} className={tone.faint} />
      <Dot cx={44} cy={34} r={4} className={tone.faint} />
      <Line x={56} y={30} w={44} className={tone.faint} />
      <Line x={56} y={38} w={92} className={tone.faint} />
      <Dot cx={44} cy={58} r={4} className={tone.faint} />
      <Line x={56} y={54} w={52} className={tone.mid} />
      <Line x={56} y={62} w={100} />
      <Dot cx={44} cy={82} r={4} className={tone.faint} />
      <Dot cx={44} cy={82} r={1.5} className={tone.mid} />
      <Line x={56} y={78} w={40} className={tone.mid} />
      <Line x={56} y={86} w={84} />
      <Line x={56} y={94} w={48} />
    </Frame>
  );
}
