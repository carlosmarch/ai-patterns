import { getTeams, type SeenIn as SeenInRef, type Team } from "@/lib/teams";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

// An overlapping row of app-icon tiles crediting the products a pattern
// ships in. With `linked`, each tile opens the public page that shows the
// pattern in that product. Hovering (or focusing) a tile shows the product
// name in a tooltip. Renders nothing when a pattern has no credits.
export function SeenIn({
  items,
  size = "md",
  showLabel = true,
  linked = false,
  className,
}: {
  items?: readonly SeenInRef[];
  size?: "sm" | "md";
  showLabel?: boolean;
  /** Link each tile to its source. Leave off inside another link, like a card. */
  linked?: boolean;
  className?: string;
}) {
  const refs = items ?? [];
  const teams = getTeams(refs.map((ref) => ref.team));
  if (teams.length === 0) return null;

  const sourceFor = new Map(refs.map((ref) => [ref.team, ref.source]));
  const names = teams.map((team) => team.name).join(", ");

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      {showLabel && <span className="text-xs text-muted-foreground">Seen in</span>}
      <ul className="flex items-center" aria-label={`Seen in ${names}`}>
        {teams.map((team, i) => {
          const source = sourceFor.get(team.id);
          return (
            <li
              key={team.id}
              className={cn("relative", i > 0 && (size === "sm" ? "-ml-1.5" : "-ml-2"))}
              style={{ zIndex: teams.length - i }}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  {linked && source ? (
                    <a
                      href={source}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`${team.name} (source)`}
                      className="block rounded-[26%] transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                    >
                      <TeamTile team={team} size={size} />
                    </a>
                  ) : (
                    <span className="block">
                      <TeamTile team={team} size={size} />
                    </span>
                  )}
                </TooltipTrigger>
                <TooltipContent>{team.name}</TooltipContent>
              </Tooltip>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function TeamTile({ team, size }: { team: Team; size: "sm" | "md" }) {
  return (
    <span
      className={cn(
        "grid place-items-center overflow-hidden rounded-[26%] shadow-[0_1px_2px_rgb(0_0_0/0.14)] ring-2 ring-background",
        size === "sm" ? "size-5" : "size-7"
      )}
      style={{ background: team.bg }}
    >
      {team.src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={team.src} alt="" className="size-full" draggable={false} />
      ) : team.mark ? (
        <span
          aria-hidden
          className={cn("font-semibold leading-none", size === "sm" ? "text-[10px]" : "text-[13px]")}
          style={{ color: team.fg }}
        >
          {team.mark}
        </span>
      ) : (
        <svg viewBox="0 0 24 24" className="size-[54%]" fill={team.fg} aria-hidden>
          <path d={team.path} />
        </svg>
      )}
    </span>
  );
}
