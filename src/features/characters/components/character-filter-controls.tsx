import { Button } from "@/components/ui/button";
import { ChevronDownIcon } from "@/components/ui/icons";
import {
  CHARACTER_GENDER_OPTIONS,
  CHARACTER_SPECIES_OPTIONS,
  CHARACTER_STATUS_OPTIONS,
  GENDER_LABELS,
  STATUS_LABELS,
  type CharacterFilters,
} from "../filters/character-filters";

const SELECT_CLASSES =
  "w-full appearance-none rounded-control border border-border bg-background py-2 pl-3 pr-9 text-body text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand";

interface CharacterFilterControlsProps {
  filters: CharacterFilters;
  onFiltersChange: (patch: Partial<CharacterFilters>) => void;
  onClearFilters: () => void;
  activeFilterCount: number;
}

export function CharacterFilterControls({
  filters,
  onFiltersChange,
  onClearFilters,
  activeFilterCount,
}: CharacterFilterControlsProps) {
  return (
    <div className="flex flex-wrap items-end gap-4">
      <fieldset className="flex min-w-52 flex-1 flex-col gap-1.5 sm:flex-none">
        <legend className="text-caption font-medium text-foreground-muted">
          Status
        </legend>
        <div className="flex flex-wrap gap-x-3 gap-y-2">
          {CHARACTER_STATUS_OPTIONS.map((status) => {
            const isChecked = filters.statuses.includes(status);
            return (
              <label
                key={status}
                className="inline-flex items-center gap-1.5 text-caption text-foreground"
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() =>
                    onFiltersChange({
                      statuses: isChecked
                        ? filters.statuses.filter((item) => item !== status)
                        : [...filters.statuses, status],
                    })
                  }
                  className="h-4 w-4 rounded border-border text-brand focus-visible:ring-2 focus-visible:ring-brand"
                />
                {STATUS_LABELS[status]}
              </label>
            );
          })}
        </div>
      </fieldset>

      <SelectField
        label="Species"
        id="character-species"
        value={filters.species}
        onChange={(value) => onFiltersChange({ species: value })}
        className="min-w-36 sm:basis-40"
      >
        <option value="">Any species</option>
        {CHARACTER_SPECIES_OPTIONS.map((species) => (
          <option key={species} value={species}>
            {species}
          </option>
        ))}
      </SelectField>
      <TextField
        label="Dimension"
        id="character-dimension"
        value={filters.dimension}
        placeholder="For example C-137"
        onChange={(value) => onFiltersChange({ dimension: value })}
        className="min-w-40 sm:basis-48"
      />
      <TextField
        label="Minimum episodes"
        id="character-min-episodes"
        value={filters.minEpisodes}
        type="number"
        onChange={(value) => onFiltersChange({ minEpisodes: value })}
        className="min-w-32 sm:basis-36"
      />
      <SelectField
        label="Sort by"
        id="character-sort"
        value={filters.sort}
        onChange={(value) =>
          onFiltersChange({ sort: value as CharacterFilters["sort"] })
        }
        className="min-w-40 sm:basis-48"
      >
        <option value="name-asc">Name, A to Z</option>
        <option value="name-desc">Name, Z to A</option>
        <option value="episodes-desc">Most episodes</option>
        <option value="episodes-asc">Fewest episodes</option>
      </SelectField>
      <SelectField
        label="Gender"
        id="character-gender"
        value={filters.gender}
        onChange={(value) => onFiltersChange({ gender: value })}
        className="min-w-36 sm:basis-40"
      >
        <option value="">Any gender</option>
        {CHARACTER_GENDER_OPTIONS.map((gender) => (
          <option key={gender} value={gender}>
            {GENDER_LABELS[gender]}
          </option>
        ))}
      </SelectField>

      <div className="flex w-full items-center justify-between gap-3 border-t border-border pt-3 sm:ml-auto sm:w-auto sm:border-0 sm:pt-0">
        <span
          className="inline-flex items-center gap-1.5 text-caption text-foreground-muted"
          aria-live="polite"
        >
          {activeFilterCount > 0 && (
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-subtle px-1.5 text-[0.7rem] font-semibold text-brand">
              {activeFilterCount}
            </span>
          )}
          {activeFilterCount > 0
            ? `filter${activeFilterCount === 1 ? "" : "s"} applied`
            : "All characters"}
        </span>
        <Button
          variant="secondary"
          onClick={onClearFilters}
          disabled={activeFilterCount === 0}
        >
          Clear all
        </Button>
      </div>
    </div>
  );
}

function TextField({
  label,
  id,
  value,
  onChange,
  placeholder,
  type = "text",
  className,
}: {
  label: string;
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: "text" | "number";
  className: string;
}) {
  return (
    <div className={`flex flex-1 flex-col gap-1.5 sm:flex-none ${className}`}>
      <label
        htmlFor={id}
        className="text-caption font-medium text-foreground-muted"
      >
        {label}
      </label>
      <input
        id={id}
        value={value}
        type={type}
        min={type === "number" ? "0" : undefined}
        inputMode={type === "number" ? "numeric" : undefined}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className={SELECT_CLASSES}
      />
    </div>
  );
}

function SelectField({
  label,
  id,
  value,
  onChange,
  className,
  children,
}: {
  label: string;
  id: string;
  value: string;
  onChange: (value: string) => void;
  className: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`flex flex-1 flex-col gap-1.5 sm:flex-none ${className}`}>
      <label
        htmlFor={id}
        className="text-caption font-medium text-foreground-muted"
      >
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={SELECT_CLASSES}
        >
          {children}
        </select>
        <ChevronDownIcon className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
      </div>
    </div>
  );
}
