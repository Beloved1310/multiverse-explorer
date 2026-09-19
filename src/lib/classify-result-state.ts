export type ResultState = "loading" | "error" | "empty" | "success";

interface ClassifyResultStateInput {
  loading: boolean;
  hasError: boolean;
  itemCount: number;
}

/**
 * Classifies a query result into exactly one UI state.
 *
 * `hasError` is checked before `itemCount`: verified against the live
 * Rick and Morty GraphQL API and its resolver source that a filter
 * matching nothing returns a successful `{ results: [] }`, never a
 * GraphQL error -- so a zero count on its own must resolve to "empty",
 * never "error".
 */
export function classifyResultState({
  loading,
  hasError,
  itemCount,
}: ClassifyResultStateInput): ResultState {
  if (loading) return "loading";
  if (hasError) return "error";
  if (itemCount === 0) return "empty";
  return "success";
}
