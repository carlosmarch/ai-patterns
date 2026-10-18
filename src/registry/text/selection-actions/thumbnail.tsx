import { Frame, Box, Line } from "@/components/thumbnail";

export default function SelectionActionsThumbnail() {
  return (
    <Frame>
      <Line x={20} y={52} w={150} />
      <Line x={20} y={64} w={40} />
      <rect x={62} y={61} width={80} height={10} rx={2} className="fill-sky-500/25" />
      <Line x={64} y={64} w={76} className="fill-sky-600/60" />
      <Line x={146} y={64} w={30} />
      <Line x={20} y={76} w={130} />
      <Line x={20} y={88} w={100} />
      <Box x={52} y={24} w={100} h={22} r={7} className="fill-zinc-900 stroke-zinc-800 dark:fill-zinc-100 dark:stroke-zinc-200" />
      <Line x={60} y={33} w={26} className="fill-white/60 dark:fill-zinc-900/60" />
      <Line x={92} y={33} w={22} className="fill-white/60 dark:fill-zinc-900/60" />
      <Line x={120} y={33} w={24} className="fill-white/60 dark:fill-zinc-900/60" />
    </Frame>
  );
}
