import "server-only";

import {
  GraphQLError,
  Kind,
  type SelectionSetNode,
  type ValidationRule,
} from "graphql";

function selectionDepth(selectionSet: SelectionSetNode, depth = 0): number {
  return selectionSet.selections.reduce((maximum, selection) => {
    if (selection.kind !== Kind.FIELD || !selection.selectionSet)
      return maximum;
    return Math.max(maximum, selectionDepth(selection.selectionSet, depth + 1));
  }, depth);
}

/** Rejects overly nested query documents before they reach the resolvers. */
export function createDepthLimitRule(maxDepth: number): ValidationRule {
  return (context) => ({
    OperationDefinition(node) {
      if (selectionDepth(node.selectionSet) > maxDepth) {
        context.reportError(
          new GraphQLError(`Query depth must not exceed ${maxDepth}.`, {
            nodes: [node],
          }),
        );
      }
    },
  });
}
