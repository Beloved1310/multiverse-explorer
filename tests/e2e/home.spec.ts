import { expect, test } from "@playwright/test";

test.describe("Home page", () => {
  test("links into each explorer section, and shows real curated collections", async ({
    page,
  }) => {
    await page.goto("/");

    await expect(
      page.getByRole("heading", { level: 1, name: "Multiverse Explorer" }),
    ).toBeVisible();

    // The three top-level entry points.
    await expect(
      page.getByRole("link", { name: /Characters/ }),
    ).toHaveAttribute("href", "/characters");
    await expect(page.getByRole("link", { name: /Episodes/ })).toHaveAttribute(
      "href",
      "/episodes",
    );
    await expect(page.getByRole("link", { name: /Locations/ })).toHaveAttribute(
      "href",
      "/locations",
    );

    // Curated collections load real data from the GraphQL layer, not
    // placeholders -- each row should end up with actual cards, not stay
    // on its loading skeleton.
    const mostSeen = page.getByRole("region", { name: "Most seen" });
    await expect(
      mostSeen.locator('a[href^="/characters/"]').first(),
    ).toBeVisible();

    const unknownOrigins = page.getByRole("region", {
      name: "Unknown origins",
    });
    await expect(
      unknownOrigins.locator('a[href^="/characters/"]').first(),
    ).toBeVisible();

    const mostResidents = page.getByRole("region", { name: "Most residents" });
    await expect(
      mostResidents.locator('a[href^="/locations/"]').first(),
    ).toBeVisible();

    // "Most seen" links into a pre-sorted characters view.
    await mostSeen.getByRole("link", { name: "See all characters" }).click();
    await expect(page).toHaveURL("/characters?sort=episodes-desc");
    await expect(page.getByLabel("Sort by")).toHaveValue("episodes-desc");
  });

  test("the site header is hidden on the home page and appears everywhere else", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.getByRole("navigation", { name: "Primary" })).toHaveCount(
      0,
    );

    await page.goto("/characters");
    await expect(
      page.getByRole("navigation", { name: "Primary" }),
    ).toBeVisible();
  });
});
