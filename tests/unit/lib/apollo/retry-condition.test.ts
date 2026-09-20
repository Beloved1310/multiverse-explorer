import { describe, expect, it, vi } from "vitest";
import { CombinedGraphQLErrors } from "@apollo/client/errors";
import {
  isRetryableNetworkError,
  retryWithBackoff,
} from "@/lib/apollo/retry-condition";

describe("isRetryableNetworkError", () => {
  it("returns true for a network error", () => {
    const networkError = new TypeError("Failed to fetch");

    expect(isRetryableNetworkError(networkError)).toBe(true);
  });

  it("returns false for a GraphQL error", () => {
    const graphQLError = new CombinedGraphQLErrors({
      data: null,
      errors: [{ message: "Character not found" }],
    });

    expect(isRetryableNetworkError(graphQLError)).toBe(false);
  });
});

describe("retryWithBackoff", () => {
  it("returns the result without retrying on the first success", async () => {
    const operation = vi.fn().mockResolvedValue("ok");

    await expect(retryWithBackoff(operation, 3, 1)).resolves.toBe("ok");
    expect(operation).toHaveBeenCalledTimes(1);
  });

  it("retries a retryable error and returns the result of a later attempt", async () => {
    const operation = vi
      .fn()
      .mockRejectedValueOnce(new TypeError("Failed to fetch"))
      .mockResolvedValueOnce("ok");

    await expect(retryWithBackoff(operation, 3, 1)).resolves.toBe("ok");
    expect(operation).toHaveBeenCalledTimes(2);
  });

  it("gives up after maxAttempts and rejects with the last error", async () => {
    const error = new TypeError("Failed to fetch");
    const operation = vi.fn().mockRejectedValue(error);

    await expect(retryWithBackoff(operation, 2, 1)).rejects.toBe(error);
    expect(operation).toHaveBeenCalledTimes(2);
  });

  it("does not retry a non-retryable GraphQL error", async () => {
    const graphQLError = new CombinedGraphQLErrors({
      data: null,
      errors: [{ message: "Character not found" }],
    });
    const operation = vi.fn().mockRejectedValue(graphQLError);

    await expect(retryWithBackoff(operation, 3, 1)).rejects.toBe(graphQLError);
    expect(operation).toHaveBeenCalledTimes(1);
  });
});
