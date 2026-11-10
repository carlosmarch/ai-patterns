import { Frame, Dot, Line, tone } from "@/components/thumbnail";

export default function ListeningStateThumbnail() {
  return (
    <Frame>
      <Dot cx={100} cy={50} r={34} className="fill-muted-foreground/5" />
      <Dot cx={100} cy={50} r={24} className="fill-muted-foreground/15" />
      <Dot cx={100} cy={50} r={13} className={tone.strong} />
      <Line x={88} y={96} w={24} />
    </Frame>
  );
}
