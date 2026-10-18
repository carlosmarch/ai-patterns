import { Frame, Line, tone } from "@/components/thumbnail";

export default function CollaborativePresenceThumbnail() {
  return (
    <Frame>
      <Line x={60} y={30} w={80} className={tone.faint} />
      {["fill-violet-500", "fill-sky-500", "fill-amber-500", "fill-emerald-500"].map((c, i) => (
        <circle key={c} cx={62 + i * 18} cy={60} r={13} className={`${c} stroke-background`} strokeWidth={2.5} />
      ))}
      <circle cx={134} cy={60} r={13} className="fill-muted stroke-background" strokeWidth={2.5} />
      <Line x={127} y={58} w={14} className={tone.strong} />
      {[0, 1].map((i) => (
        <circle key={i} cx={71 + i * 18} cy={70} r={3.5} className="fill-emerald-500 stroke-background" strokeWidth={1.5} />
      ))}
      <Line x={66} y={86} w={68} h={3} className={tone.faint} />
    </Frame>
  );
}
