import { describe, expect, it } from "vitest";
import { classifyResultState } from "@/lib/classify-result-state";

describe("classifyResultState", () => {
  it("returns 'loading' while the request is in flight", () => {
    expect(
      classifyResultState({ loading: true, hasError: false, itemCount: 0 }),
    ).toBe("loading");
  });

  it("returns 'loading' even if a stale error or count is also present", () => {
    expect(
      classifyResultState({ loading: true, hasError: true, itemCount: 5 }),
    ).toBe("loading");
  });

  it("returns 'error' when the request failed", () => {
    expect(
      classifyResultState({ loading: false, hasError: true, itemCount: 0 }),
    ).toBe("error");
  });

  it("returns 'empty' when the request succeeded with zero results", () => {
    expect(
      classifyResultState({ loading: false, hasError: false, itemCount: 0 }),
    ).toBe("empty");
  });

  it("returns 'success' when the request succeeded with results", () => {
    expect(
      classifyResultState({ loading: false, hasError: false, itemCount: 5 }),
    ).toBe("success");
  });
});
