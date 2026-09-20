import { expect, test } from "@playwright/test";

const episodeCards = (page: import("@playwright/test").Page) =>
  page.locator('a[href^="/episodes/"]');

test.describe("Episode search and filters", () => {
  test("searching by name narrows the grid, and Clear all resets it", async ({
    page,
  }) => {
    await page.goto("/episodes");

    await expect(episodeCards(page).first()).toBeVisible();

    await page.getByPlaceholder("Search episodes…").fill("pilot");
    // Wait for the debounced filter to actually land in the URL first --
    // the unfiltered page also matches "Showing N of M episodes", so that
    // text alone doesn't prove the filtered request has come back yet.
    await expect(page).toHaveURL(/name=pilot/);
    await expect(page.getByText(/^Showing \d+ of \d+ episodes$/)).toBeVisible();

    const filtered = episodeCards(page);
    await expect(filtered.first()).toBeVisible();
    for (const card of await filtered.all()) {
      await expect(card).toContainText(/pilot/i);
    }

    await page.getByRole("button", { name: "Clear all" }).click();
    await expect(page.getByPlaceholder("Search episodes…")).toHaveValue("");
    await expect(
      page.getByRole("button", { name: "Clear all" }),
    ).toBeDisabled();
  });

  test("filtering by production code matches only that code, not the episode name", async ({
    page,
  }) => {
    await page.goto("/episodes");

    await page.getByLabel("Episode code").fill("S01E01");
    await expect(page).toHaveURL(/code=S01E01/);

    const cards = episodeCards(page);
    await expect(cards.first()).toBeVisible();
    await expect(cards).toHaveCount(1);
    await expect(cards.first()).toContainText("S01E01");
  });
});

test.describe("Episode detail page", () => {
  test("opening an episode shows its cast, and a cast member's own profile", async ({
    page,
  }) => {
    await page.goto("/episodes");

    const firstCard = episodeCards(page).first();
    const episodeName = await firstCard.locator("h3").innerText();
    await firstCard.click();

    await expect(page).toHaveURL(/\/episodes\/\d+$/);
    await expect(
      page.getByRole("heading", { level: 2, name: episodeName }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Characters in this episode" }),
    ).toBeVisible();

    // The cast section uses returnPartialData, so it can render an
    // incomplete, differently-ordered list for an instant before the full
    // network response replaces it (see use-episode-detail.ts) -- reading
    // a name from it before that settles would race the real list.
    await page.waitForLoadState("networkidle");

    const castMember = page.locator('a[href^="/characters/"]').first();
    await expect(castMember).toBeVisible();
    const castName = await castMember.locator("h3").innerText();
    await castMember.click();

    await expect(page).toHaveURL(/\/characters\/\d+$/);
    await expect(
      page.getByRole("heading", { level: 2, name: castName }),
    ).toBeVisible();
  });

  test("visiting an episode id that doesn't exist shows a not-found state", async ({
    page,
  }) => {
    await page.goto("/episodes");
    await page.goto("/episodes/999999999");

    await expect(page.getByText("Episode not found.")).toBeVisible();
  });
});
