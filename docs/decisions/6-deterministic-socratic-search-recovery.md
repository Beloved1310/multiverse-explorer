# 013. Deterministic Socratic search recovery instead of LLM ranking

## Status

Accepted

## Context

Character search can correctly return no matches when a visitor remembers an incomplete, conflicting, or slightly misspelled detail. An empty result should not become a dead end.

## Decision

The BFF produces one next recovery question from its cached connected dataset. It checks which remembered detail can be relaxed, groups the resulting matches into real alternatives, and returns each option with its result count and a replacement filter. Name suggestions use deterministic edit distance, not a language model.

The client renders that question and writes the selected replacement filter into the existing URL state. It does not choose the question or invent options.

## Consequences

Every suggestion is explainable and verifiable: selecting it has a known positive result count. The approach is fast, testable, accessible, and needs no extra upstream request or model call. It deliberately handles structured memory only. A future LLM may interpret free-form memories, but its proposed filters must still be validated by this BFF before they are shown or applied.
