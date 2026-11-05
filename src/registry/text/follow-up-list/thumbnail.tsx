import { Frame, Line } from "@/components/thumbnail";

export default function FollowUpListThumbnail() {
  return (
    <Frame>
      {[24, 46, 68, 90].map((y, i) => (
        <Line key={y} x={30} y={y} w={[110, 90, 120, 80][i]} />
      ))}
    </Frame>
  );
}
