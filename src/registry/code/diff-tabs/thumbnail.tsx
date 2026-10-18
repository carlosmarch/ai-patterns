import { Frame, Box, Button, Line, tone } from "@/components/thumbnail";

export default function DiffTabsThumbnail() {
  return (
    <Frame>
      <Button x={24} y={12} w={40} h={12} />
      <Button x={68} y={12} w={44} h={12} outline />
      <Button x={116} y={12} w={36} h={12} outline />
      <Box x={20} y={32} w={160} h={78} r={8} />
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const kind = i === 2 ? "del" : i === 3 || i === 4 ? "add" : "ctx";
        const y = 40 + i * 11;
        return (
          <g key={i}>
            {kind !== "ctx" && (
              <rect x={21} y={y - 2} width={158} height={10} className={kind === "add" ? "fill-emerald-500/15" : "fill-red-500/15"} />
            )}
            <Line x={28} y={y + 1} w={6} h={3} className={tone.faint} />
            <Line
              x={40}
              y={y + 1}
              w={[70, 100, 84, 60, 92, 50][i]}
              h={3}
              className={kind === "add" ? "fill-emerald-600/70" : kind === "del" ? "fill-red-600/70" : tone.text}
            />
          </g>
        );
      })}
    </Frame>
  );
}
