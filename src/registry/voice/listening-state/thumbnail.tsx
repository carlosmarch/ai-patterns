import { Frame, Dot, tone } from "@/components/thumbnail";

export default function ListeningStateThumbnail() {
  return (
    <Frame>
      <Dot cx={100} cy={60} r={40} className="fill-muted-foreground/5" />
      <Dot cx={100} cy={60} r={28} className="fill-muted-foreground/15" />
      <Dot cx={100} cy={60} r={16} className={tone.strong} />
    </Frame>
  );
}
