# 7. Make search feedback visible and catalogue density purposeful

## Status

Accepted

## Context

The explorer pages felt disconnected from the Rick and Morty subject matter. A lavender gradient, small uppercase purple labels, and large illustrated cards made the product feel like a generic generated template rather than a fast archive for a strange, image-led universe.

The search interaction also had a gap: a visitor could type a term and receive new results, but could not immediately see why an item matched. At desktop width, the large three-column card grid also made browsing unnecessarily slow.

## Decision

Use a restrained, high-contrast base with an acid-green primary accent and cyan location accent. Remove decorative page gradients and uppercase brows. Let official character imagery and the content itself carry the Rick and Morty identity.

Highlight the typed name term inside matching card titles. Keep the query in the URL as the source of truth, so highlighting always reflects the active search.

Use a denser responsive catalogue grid: two cards at narrow widths and four at large desktop widths, with smaller gaps. Keep related-data sections at a more spacious density because comparison and detail tasks require more reading.

## Consequences

Visitors can scan more results without losing image recognition, and matched text makes search results easier to verify. The visual system is less decorative and more specific to the data.

Autocomplete remains a separate enhancement because it needs a reusable, keyboard-operable suggestion component and query lifecycle. It should not be approximated with static suggestions.
