export function SiteHeader() {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-4 sm:px-6 lg:px-8">
        <span
          aria-hidden="true"
          className="h-9 w-9 shrink-0 rounded-full bg-[conic-gradient(from_180deg,var(--color-brand),var(--color-accent),var(--color-brand))] p-0.5"
        >
          <span className="block h-full w-full rounded-full bg-background" />
        </span>
        <div>
          <h1 className="text-display leading-none font-bold text-foreground">
            Multiverse Explorer
          </h1>
          <p className="mt-1 text-caption text-foreground-muted">
            Every being, every reality &mdash; search the multiverse.
          </p>
        </div>
      </div>
    </header>
  );
}
