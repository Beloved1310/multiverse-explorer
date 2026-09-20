import { buildSchema, parse, validate } from "graphql";
import { describe, expect, it } from "vitest";
import { createDepthLimitRule } from "@/server/graphql/depth-limit";

const schema = buildSchema(`
  type Node {
    id: ID
    child: Node
  }
  type Query {
    node: Node
  }
`);

function depthErrors(query: string, maxDepth: number) {
  return validate(schema, parse(query), [createDepthLimitRule(maxDepth)]);
}

describe("createDepthLimitRule", () => {
  it("allows a query at exactly the depth limit", () => {
    const errors = depthErrors("{ node { child { child { id } } } }", 3);
    expect(errors).toHaveLength(0);
  });

  it("rejects a query nested deeper than the limit", () => {
    const errors = depthErrors(
      "{ node { child { child { child { id } } } } }",
      3,
    );
    expect(errors).toHaveLength(1);
    expect(errors.map((error) => error.message)).toEqual([
      "Query depth must not exceed 3.",
    ]);
  });

  it("counts leaf scalar fields as free, only nested selection sets add depth", () => {
    const errors = depthErrors("{ node { id } }", 1);
    expect(errors).toHaveLength(0);
  });
});
