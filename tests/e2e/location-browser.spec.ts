import { expect, test } from "@playwright/test";

// Location cards have no distinguishing accessible-name pattern like
// characters' "Portrait of <name>" -- their href prefix is the reliable
// selector.
const locationCards = (page: import("@playwright/test").Page) =>
  page.locator('a[href^="/locations/"]');

test.describe("Location search and filters", () => {
  test("searching narrows the grid, and Clear all resets it", async ({
    page,
  }) => {
    await page.goto("/locations");

    await expect(locationCards(page).first()).toBeVisible();

    await page.getByPlaceholder("Search locations…").fill("earth");
    await expect(
      page.getByText(/^Showing \d+ of \d+ locations$/),
    ).toBeVisible();

    const filtered = locationCards(page);
    await expect(filtered.first()).toBeVisible();
    for (const card of await filtered.all()) {
      await expect(card).toContainText(/earth/i);
    }

    await page.getByRole("button", { name: "Clear all" }).click();
    await expect(page.getByPlaceholder("Search locations…")).toHaveValue("");
    await expect(
      page.getByRole("button", { name: "Clear all" }),
    ).toBeDisabled();
  });

  test("the dimension filter commits to the URL and groups the results under a matching dimension heading", async ({
    page,
  }) => {
    await page.goto("/locations");

    await page.getByLabel("Dimension").fill("C-137");
    await expect(page).toHaveURL(/dimension=C-137/);

    // Results are grouped into a <section> per dimension (see
    // group-locations-by-dimension.ts); a card no longer repeats its own
    // dimension once it's under that heading.
    const groupHeading = page.getByRole("heading", { level: 2 }).first();
    await expect(groupHeading).toContainText("C-137");
    await expect(locationCards(page).first()).toBeVisible();
  });
});

test.describe("Location detail page", () => {
  test("opening a location shows its residents and links back into the character filters by dimension", async ({
    page,
  }) => {
    await page.goto("/locations");

    const firstCard = locationCards(page).first();
    const locationName = await firstCard.locator("h3").innerText();
    await firstCard.click();

    await expect(page).toHaveURL(/\/locations\/\d+$/);
    await expect(
      page.getByRole("heading", { level: 2, name: locationName }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Residents", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Episodes featuring residents" }),
    ).toBeVisible();

    // Only rendered when the dimension isn't "Unknown" -- most locations
    // in the real dataset do have one, but this keeps the test honest
    // about that instead of assuming it. Whether any character actually
    // matches is a fact about live data (a location can have zero
    // confirmed residents), not something this link controls, so this
    // checks the filter it hands off, not a guaranteed non-empty result.
    const dimensionLink = page.getByRole("link", {
      name: "Browse characters in this dimension",
    });
    if (await dimensionLink.isVisible()) {
      const href = await dimensionLink.getAttribute("href");
      const expectedDimension = new URL(href!, page.url()).searchParams.get(
        "dimension",
      );
      await dimensionLink.click();

      await expect(page).toHaveURL(/\/characters\?dimension=/);
      await expect(page.getByLabel("Dimension")).toHaveValue(
        expectedDimension!,
      );
      await expect(page.getByText(/1\s*filter applied/)).toBeVisible();
    }
  });

  test("visiting a location id that doesn't exist shows a not-found state", async ({
    page,
  }) => {
    await page.goto("/locations");
    await page.goto("/locations/999999999");

    await expect(page.getByText("Location not found.")).toBeVisible();
  });
});
