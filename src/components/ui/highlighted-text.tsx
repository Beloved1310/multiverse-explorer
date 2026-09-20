import type { ReactNode } from "react";

export function HighlightedText({
  text,
  query,
}: {
  text: string;
  query?: string;
}): ReactNode {
  const term = query?.trim();
  if (!term) return text;
  const expression = new RegExp(
    `(${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
    "ig",
  );
  return text.split(expression).map((part, index) =>
    part.toLocaleLowerCase() === term.toLocaleLowerCase() ? (
      <mark
        key={index}
        className="rounded-sm bg-lime-200 px-0.5 text-inherit dark:bg-lime-700"
      >
        {part}
      </mark>
    ) : (
      part
    ),
  );
}
