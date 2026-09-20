import Link from "next/link";
import {
  ChevronRightIcon,
  FilmIcon,
  MapPinIcon,
  UsersIcon,
} from "@/components/ui/icons";
import { Card } from "@/components/ui/card";

const SECTIONS = [
  {
    href: "/characters",
    title: "Characters",
    description: "Every being across every reality.",
    icon: UsersIcon,
    gradient: "from-brand to-brand-strong",
  },
  {
    href: "/episodes",
    title: "Episodes",
    description: "Every episode the multiverse has aired.",
    icon: FilmIcon,
    gradient: "from-accent to-brand",
  },
  {
    href: "/locations",
    title: "Locations",
    description: "Every place worth (or not worth) visiting.",
    icon: MapPinIcon,
    gradient: "from-brand-strong to-accent",
  },
] as const;

export default function Home() {
  return (
    <main className="mx-auto flex max-w-6xl flex-col items-center gap-12 px-4 py-16 text-center sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4">
        <h1 className="text-5xl font-black text-foreground sm:text-6xl">
          Multiverse Explorer
        </h1>
        <p className="mx-auto max-w-xl text-body text-foreground-muted sm:text-heading">
          Every being, every reality &mdash; search the multiverse.
        </p>
      </div>

      <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-3">
        {SECTIONS.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            className="group rounded-card text-left focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
          >
            <Card className="overflow-hidden transition-all duration-200 group-hover:-translate-y-0.5 group-hover:border-brand/40 group-hover:shadow-lg group-hover:shadow-brand/10">
              <div
                aria-hidden="true"
                className={`flex aspect-square items-center justify-center bg-linear-to-br ${section.gradient}`}
              >
                <section.icon className="h-16 w-16 text-white" />
              </div>
              <div className="flex items-center justify-between gap-2 p-4">
                <div>
                  <h2 className="text-heading font-semibold text-foreground">
                    {section.title}
                  </h2>
                  <p className="text-caption text-foreground-muted">
                    {section.description}
                  </p>
                </div>
                <ChevronRightIcon className="h-5 w-5 shrink-0 text-foreground-muted transition-transform group-hover:translate-x-0.5 group-hover:text-brand" />
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </main>
  );
}
