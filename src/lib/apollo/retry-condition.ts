import { CombinedGraphQLErrors } from "@apollo/client/errors";
import type { ErrorLike } from "@apollo/client";

/**
 * RetryLink's `attempts.retryIf` predicate: retry transport/network failures,
 * never a GraphQL error returned by the server (a validation or resolver
 * error will fail identically on every retry).
 */
export function isRetryableNetworkError(error: ErrorLike): boolean {
  return (
    !CombinedGraphQLErrors.is(error) &&
    !("graphQLErrors" in error && Array.isArray(error.graphQLErrors))
  );
}

/** Shared server/client retry policy: three attempts with exponential backoff. */
export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxAttempts = 3,
  initialDelayMs = 300,
): Promise<T> {
  let attempt = 0;

  while (true) {
    try {
      return await operation();
    } catch (error) {
      attempt += 1;
      if (
        attempt >= maxAttempts ||
        !isRetryableNetworkError(error as ErrorLike)
      ) {
        throw error;
      }

      await new Promise((resolve) =>
        setTimeout(resolve, initialDelayMs * 2 ** (attempt - 1)),
      );
    }
  }
}
