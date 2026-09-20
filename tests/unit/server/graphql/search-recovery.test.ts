import { describe, expect, it } from "vitest";
import { createSearchRecovery } from "@/server/graphql/search-recovery";
import type { ConnectedCharacter } from "@/server/data/types";

function character(
  id: string,
  name: string,
  status: string,
  species = "Human",
): ConnectedCharacter {
  return {
    id,
    name,
    status,
    species,
    gender: "Male",
    image: "",
    originId: null,
    locationId: null,
    episodeIds: [],
    episodeCount: 1,
    origin: null,
    location: {
      id: "earth",
      name: "Earth",
      type: "Planet",
      dimension: "C-137",
      residentIds: [],
    },
  };
}

const characters = [
  character("1", "Birdperson", "Alive"),
  character("2", "Rick Sanchez", "Alive"),
  character("3", "Tammy Guetermann", "Dead", "Human"),
];

describe("createSearchRecovery", () => {
  it("does not offer recovery when the existing search has matches", () => {
    expect(createSearchRecovery(characters, { name: "rick" })).toBeNull();
  });

  it("offers deterministic spelling alternatives for an unmatched name", () => {
    expect(
      createSearchRecovery(characters, { name: "bird person" }),
    ).toMatchObject({
      step: "NAME",
      options: [
        {
          label: "Birdperson",
          count: 1,
          filter: { name: "Birdperson" },
        },
      ],
    });
  });

  it("only offers status options that would produce results", () => {
    const recovery = createSearchRecovery(characters, {
      name: "rick",
      statuses: ["dead"],
    });

    expect(recovery).toMatchObject({ step: "STATUS" });
    expect(recovery?.options).toEqual([
      {
        label: "Alive",
        value: "Alive",
        count: 1,
        filter: { name: "rick", statuses: ["Alive"] },
      },
    ]);
  });
});
