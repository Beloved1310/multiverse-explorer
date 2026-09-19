import { describe, expect, it } from "vitest";
import { CombinedGraphQLErrors } from "@apollo/client/errors";
import { isRetryableNetworkError } from "./retry-condition";

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
