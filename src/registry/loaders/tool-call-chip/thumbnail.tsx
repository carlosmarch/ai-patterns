import { Frame, Button, Dot, Line, tone } from "@/components/thumbnail";

export default function ToolCallChipThumbnail() {
  return (
    <Frame>
      <Line x={30} y={28} w={130} />
      <Button x={30} y={44} w={80} h={14} outline />
      <Dot cx={40} cy={51} r={3} className="stroke-muted-foreground" dashed />
      <Line x={48} y={49} w={52} />
      <Button x={30} y={66} w={96} h={14} outline />
      <Dot cx={40} cy={73} r={3} className={tone.strong} />
      <Line x={48} y={71} w={70} />
      <Line x={30} y={92} w={110} className={tone.faint} />
    </Frame>
  );
}
