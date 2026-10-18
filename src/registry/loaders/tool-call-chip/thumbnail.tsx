import { Frame, Button, Check, Dot, Line, tone } from "@/components/thumbnail";

export default function ToolCallChipThumbnail() {
  return (
    <Frame>
      <Line x={24} y={22} w={140} />
      <Line x={24} y={32} w={100} />
      <Button x={24} y={46} w={84} h={16} outline />
      <Dot cx={34} cy={54} r={3.5} className="stroke-sky-500" dashed />
      <Line x={42} y={52} w={58} />
      <Button x={24} y={70} w={104} h={16} className="fill-emerald-500/10 stroke-emerald-500/50" />
      <Dot cx={34} cy={78} r={4} className="fill-emerald-500" />
      <Check cx={34} cy={78} s={2} className="stroke-white" />
      <Line x={42} y={76} w={78} />
      <Line x={24} y={98} w={120} className={tone.faint} />
    </Frame>
  );
}
