const numberFormatter = new Intl.NumberFormat("en-GB");

/** The one place a count gets a thousands separator -- e.g. "1,234", not "1234". */
export function formatNumber(value: number): string {
  return numberFormatter.format(value);
}

// No formatDate here deliberately: the Rick and Morty API returns air_date
// as an already-formatted display string (e.g. "December 2, 2013"), not an
// ISO timestamp. Re-parsing a human-formatted string from a third-party API
// just to run it back through Intl.DateTimeFormat is fragile -- a handful
// of entries could silently become "Invalid Date" -- for no real benefit,
// since the source string is already in a reasonable, readable format. If
// the API ever exposes a raw timestamp field, format it here.
