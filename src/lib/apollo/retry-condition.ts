import { CombinedGraphQLErrors } from "@apollo/client/errors";
import type { ErrorLike } from "@apollo/client";

/**
 * RetryLink's `attempts.retryIf` predicate: retry transport/network failures,
 * never a GraphQL error returned by the server (a validation or resolver
 * error will fail identically on every retry).
 */
export function isRetryableNetworkError(error: ErrorLike): boolean {
  return !CombinedGraphQLErrors.is(error);
}
