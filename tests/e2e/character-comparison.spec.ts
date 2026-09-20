import { expect, test } from "@playwright/test";

test.describe("Character comparison", () => {
  test("picking two different characters shows their shared episodes and locations", async ({
    page,
  }) => {
    await page.goto("/compare");

    // The real dataset has several dimensional variants all literally
    // named "Rick Sanchez" -- `.first()` within each picker's own list
    // pins this to one deterministic (if unspecified) id per picker,
    // rather than requiring name-uniqueness the data doesn't have.
    await page.getByLabel("First character").fill("rick sanchez");
    await page
      .getByRole("list", { name: "First character matches" })
      .getByRole("button", { name: "Rick Sanchez", exact: true })
      .first()
      .click();
    // setCharacter() builds the next URL from the current searchParams
    // read at call time, not a ref -- picking the second character before
    // this first navigation has actually landed can overwrite it and
    // silently drop `first`. Waiting here is what makes that not happen.
    await expect(page).toHaveURL(/first=\d+/);

    await page.getByLabel("Second character").fill("morty smith");
    await page
      .getByRole("list", { name: "Second character matches" })
      .getByRole("button", { name: "Morty Smith", exact: true })
      .first()
      .click();

    await expect(page).toHaveURL(/first=\d+&second=\d+/);
    await expect(
      page.getByRole("region", { name: "Selected characters" }),
    ).toBeVisible();

    // Rick and Morty share the Pilot at minimum, in every version of this
    // dataset (live or the checked-in snapshot) -- a real, stable fact
    // about the show, not an assumption about test data.
    await expect(
      page.getByRole("heading", { name: "Shared episodes" }),
    ).toBeVisible();
    await expect(page.getByText("Pilot")).toBeVisible();
  });

  test("picking the same character twice shows a warning instead of a comparison", async ({
    page,
  }) => {
    await page.goto("/compare");

    // Scoped to each picker's own matches list, not just "the first Rick
    // Sanchez button on the page" -- once both pickers show the same
    // name, an unscoped query would click whichever list renders first
    // both times, and `second` would never actually get set. Both
    // pickers query the same filter independently, so `.first()` in each
    // resolves to the same id both times.
    await page.getByLabel("First character").fill("rick sanchez");
    await page
      .getByRole("list", { name: "First character matches" })
      .getByRole("button", { name: "Rick Sanchez", exact: true })
      .first()
      .click();
    await expect(page).toHaveURL(/first=\d+/);

    await page.getByLabel("Second character").fill("rick sanchez");
    await page
      .getByRole("list", { name: "Second character matches" })
      .getByRole("button", { name: "Rick Sanchez", exact: true })
      .first()
      .click();

    await expect(
      page.getByText("Choose two different characters."),
    ).toBeVisible();
    await expect(
      page.getByRole("region", { name: "Selected characters" }),
    ).not.toBeVisible();
  });

  test("does not search until at least two characters are typed", async ({
    page,
  }) => {
    await page.goto("/compare");

    const input = page.getByLabel("First character");
    await input.fill("r");
    await expect(
      page.getByRole("list", { name: "First character matches" }),
    ).toHaveCount(0);

    await input.fill("ri");
    await expect(
      page.getByRole("list", { name: "First character matches" }),
    ).toBeVisible();
  });
});
