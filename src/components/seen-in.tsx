import { getTeams, type Team, type TeamId } from "@/lib/teams";
import { cn } from "@/lib/utils";

// An overlapping row of app-icon tiles crediting the products a pattern
// ships in. Renders nothing when a pattern has no `seenIn` entries yet.
export function SeenIn({
  ids,
  size = "md",
  showLabel = true,
  className,
}: {
  ids?: readonly TeamId[];
  size?: "sm" | "md";
  showLabel?: boolean;
  className?: string;
}) {
  const teams = getTeams(ids ?? []);
  if (teams.length === 0) return null;

  const names = teams.map((team) => team.name).join(", ");

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      {showLabel && <span className="text-xs text-muted-foreground">Seen in</span>}
      <ul className="flex items-center" aria-label={`Seen in ${names}`} title={names}>
        {teams.map((team, i) => (
          <li
            key={team.id}
            className={cn(i > 0 && (size === "sm" ? "-ml-1.5" : "-ml-2"))}
            style={{ zIndex: teams.length - i }}
          >
            <TeamTile team={team} size={size} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function TeamTile({ team, size }: { team: Team; size: "sm" | "md" }) {
  return (
    <span
      title={team.name}
      className={cn(
        "grid place-items-center overflow-hidden rounded-[26%] shadow-[0_1px_2px_rgb(0_0_0/0.14)] ring-2 ring-background",
        size === "sm" ? "size-5" : "size-7"
      )}
      style={{ background: team.bg }}
    >
      {team.src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={team.src} alt="" className="size-full" draggable={false} />
      ) : (
        <svg viewBox="0 0 24 24" className="size-[54%]" fill={team.fg} aria-hidden>
          <path d={team.path} />
        </svg>
      )}
    </span>
  );
}
