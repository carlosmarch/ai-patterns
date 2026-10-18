import { Frame, Box, Dot, Line } from "@/components/thumbnail";

export default function TerminalStreamThumbnail() {
  return (
    <Frame>
      <Box x={20} y={12} w={160} h={96} r={8} className="fill-zinc-900 stroke-zinc-800" />
      <Dot cx={30} cy={22} r={2} className="fill-zinc-600" />
      <Dot cx={37} cy={22} r={2} className="fill-zinc-600" />
      <Dot cx={44} cy={22} r={2} className="fill-zinc-600" />
      <Line x={20} y={30} w={160} h={0.75} className="fill-zinc-800" />
      {[38, 48, 58, 68, 78, 88].map((y, i) => (
        <g key={y}>
          <Line x={30} y={y} w={4} h={3} className="fill-emerald-400" />
          <Line x={38} y={y} w={[90, 60, 110, 74, 98, 40][i]} h={3} className={i === 2 ? "fill-amber-300/70" : "fill-zinc-500"} />
        </g>
      ))}
      <Box x={82} y={86.5} w={4} h={6} r={0.5} className="fill-zinc-300" />
    </Frame>
  );
}
