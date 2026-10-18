import { Frame } from "@/components/thumbnail";

export default function CollaborativePresenceThumbnail() {
  return (
    <Frame>
      {[0, 1, 2, 3].map((i) => (
        <circle key={i} cx={68 + i * 18} cy={60} r={13} className="fill-muted stroke-background" strokeWidth={2.5} />
      ))}
      {[0, 1].map((i) => (
        <circle key={i} cx={77 + i * 18} cy={70} r={3.5} className="fill-foreground stroke-background" strokeWidth={1.5} />
      ))}
    </Frame>
  );
}
