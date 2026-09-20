import Link from "next/link";
import Image from "next/image";
import { ChevronRightIcon } from "@/components/ui/icons";
import { Card } from "@/components/ui/card";
import { CuratedCollections } from "@/features/characters/components/curated-collections";

const SECTIONS = [
  {
    href: "/characters",
    title: "Characters",
    description: "Every being across every reality.",
    image: "/images/characters-atlas-v2.png",
    imageAlt:
      "Original travelers and imagined beings gathered in an interdimensional archive",
  },
  {
    href: "/episodes",
    title: "Episodes",
    description: "Every episode the multiverse has aired.",
    image: "/images/episodes-atlas.png",
    imageAlt: "A vintage television floating through a star field",
  },
  {
    href: "/locations",
    title: "Locations",
    description: "Every place worth (or not worth) visiting.",
    image: "/images/locations-atlas.png",
    imageAlt: "A distant landscape connected by a glowing portal",
  },
] as const;

export default function Home() {
  return (
    <main className="mx-auto flex max-w-6xl flex-col items-center gap-12 px-4 py-18 text-center sm:px-6 lg:px-8">
      <div className="flex flex-col items-center gap-4">
        <span
          aria-hidden="true"
          className="h-12 w-12 rounded-full bg-[conic-gradient(from_180deg,var(--color-brand),var(--color-accent),var(--color-brand))] p-1"
        >
          <span className="block h-full w-full rounded-full bg-background" />
        </span>
        <h1 className="font-display text-5xl font-semibold tracking-tight text-foreground sm:text-6xl">
          Multiverse Explorer
        </h1>
        <p className="mx-auto max-w-xl text-body text-foreground-muted sm:text-heading">
          Every being, every reality &mdash; search the multiverse.
        </p>
      </div>

      <div className="grid w-full grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
        {SECTIONS.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            className="group rounded-card text-left focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
          >
            <Card className="h-full overflow-hidden transition-[transform,border-color,box-shadow] duration-300 group-hover:-translate-y-0.5 group-hover:border-brand/40 group-hover:shadow-xl group-hover:shadow-brand/10 motion-reduce:transition-none">
              <div className="relative aspect-[4/3] overflow-hidden bg-brand-subtle sm:aspect-[5/4] lg:aspect-[4/3]">
                <Image
                  src={section.image}
                  alt={section.imageAlt}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.035] motion-reduce:transition-none"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-linear-to-t from-black/65 via-black/5 to-transparent"
                />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5 text-left">
                  <div className="min-w-0">
                    <p className="mb-1 text-caption font-medium tracking-[0.12em] text-white/75 uppercase">
                      Explore
                    </p>
                    <h2 className="font-display text-2xl font-semibold tracking-tight text-white">
                      {section.title}
                    </h2>
                  </div>
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/35 bg-black/15 text-white backdrop-blur-sm transition-transform duration-300 group-hover:translate-x-0.5 motion-reduce:transition-none">
                    <ChevronRightIcon className="h-5 w-5" />
                  </span>
                </div>
              </div>
              <div className="p-5 text-left">
                <p className="max-w-[32ch] text-body leading-relaxed text-foreground-muted">
                  {section.description}
                </p>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      <CuratedCollections />
    </main>
  );
}
