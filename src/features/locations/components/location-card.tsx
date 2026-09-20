import Link from "next/link";
import { Card } from "@/components/ui/card";
import { MapPinIcon, UsersIcon } from "@/components/ui/icons";
import { formatNumber } from "@/lib/format";
import { pluralize } from "@/lib/pluralize";
import type { Location } from "../domain/location";

interface LocationCardProps {
  location: Location;
  /** Hidden when the card already sits under a dimension-grouped heading. */
  showDimension?: boolean;
}

export function LocationCard({
  location,
  showDimension = true,
}: LocationCardProps) {
  return (
    <Link
      href={`/locations/${location.id}`}
      className="group block rounded-card focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
    >
      <Card className="h-full overflow-hidden transition-[transform,border-color,box-shadow] duration-300 group-hover:-translate-y-1 group-hover:border-accent/40 group-hover:shadow-xl group-hover:shadow-accent/10 motion-reduce:transition-none">
        <div className="flex items-center justify-between gap-2 border-b border-accent/10 bg-accent-subtle px-4 py-3">
          <span className="flex items-center gap-1.5 text-caption font-semibold text-accent">
            <MapPinIcon className="h-3.5 w-3.5" />
            {location.type}
          </span>
          {showDimension && (
            <span
              className="truncate text-caption text-foreground-muted"
              title={location.dimension}
            >
              {location.dimension}
            </span>
          )}
        </div>

        <div className="flex min-h-28 flex-col justify-between gap-4 p-4">
          <h3 className="line-clamp-2 text-heading font-semibold text-foreground">
            {location.name}
          </h3>
          <p className="flex items-center gap-1.5 text-caption text-foreground-muted">
            <UsersIcon className="h-3.5 w-3.5 shrink-0 text-accent" />
            {formatNumber(location.residentCount)}{" "}
            {pluralize("resident", location.residentCount)}
          </p>
        </div>
      </Card>
    </Link>
  );
}
