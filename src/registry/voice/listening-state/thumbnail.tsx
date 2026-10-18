import { Frame, Dot } from "@/components/thumbnail";

export default function ListeningStateThumbnail() {
  return (
    <Frame>
      <Dot cx={100} cy={60} r={44} className="fill-sky-500/5 stroke-sky-500/15" />
      <Dot cx={100} cy={60} r={32} className="fill-sky-500/10 stroke-sky-500/25" />
      <Dot cx={100} cy={60} r={20} className="fill-sky-500" />
      <rect x={96} y={50} width={8} height={13} rx={4} className="fill-white" />
      <path d="M92 60 a8 8 0 0 0 16 0 M100 68 v4" className="stroke-white" strokeWidth={1.4} strokeLinecap="round" />
    </Frame>
  );
}
