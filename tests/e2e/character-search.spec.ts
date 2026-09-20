import { expect, test } from "@playwright/test";

test.describe("Character search and filters", () => {
  test("searching narrows the grid to matching characters, and Clear all resets it", async ({
    page,
  }) => {
    await page.goto("/characters");

    const cards = page.getByRole("link", { name: /Portrait of/ });
    await expect(cards.first()).toBeVisible();
    const fullCount = await cards.count();

    await page.getByPlaceholder("Search characters…").fill("rick");
    // Wait for the debounced filter to actually land in the URL first --
    // the unfiltered page also matches "Showing N of M beings", so under
    // load that text alone can be checked before the filtered request
    // has come back, letting stale results slip through.
    await expect(page).toHaveURL(/name=rick/);
    await expect(page.getByText(/^Showing \d+ of \d+ beings$/)).toBeVisible();
    await expect(cards.first()).toBeVisible();

    const filteredCards = await cards.count();
    expect(filteredCards).toBeGreaterThan(0);
    expect(filteredCards).toBeLessThanOrEqual(fullCount);

    for (const card of await cards.all()) {
      await expect(card).toContainText(/rick/i);
    }

    await page.getByRole("button", { name: "Clear all" }).click();
    await expect(page.getByPlaceholder("Search characters…")).toHaveValue("");
    await expect(
      page.getByRole("button", { name: "Clear all" }),
    ).toBeDisabled();
  });

  test("filtering by status only shows characters with that status", async ({
    page,
  }) => {
    await page.goto("/characters");

    // Status is a set of checkboxes (one per status), not a <select> --
    // and a plain click, not `.check()`, since `.check()`'s own built-in
    // post-click state assertion races the client-side navigation this
    // triggers.
    await page.getByLabel("Dead").click();
    await expect(page).toHaveURL(/status=dead/);
    // No literal space between the count badge and "filter applied" in
    // the rendered DOM (JSX drops the whitespace-only line between them).
    await expect(page.getByText(/1\s*filter applied/)).toBeVisible();

    const cards = page.getByRole("link", { name: /Portrait of/ });
    await expect(cards.first()).toBeVisible();

    for (const card of await cards.all()) {
      await expect(card.getByText("Dead")).toBeVisible();
    }
  });

  test("combines a species filter with a minimum episode count", async ({
    page,
  }) => {
    await page.goto("/characters");

    await page.getByLabel("Species").selectOption("Human");
    // Waiting for the first filter to land before setting the second:
    // both read-modify-write the same URL via a ref synced from
    // searchParams (see useCharacterFilters), so firing them back-to-back
    // without letting the first navigation settle can race and drop one.
    await expect(page).toHaveURL(/species=Human/);
    await page.getByLabel("Minimum episodes").fill("10");
    await expect(page).toHaveURL(/minEpisodes=10/);
    await expect(page).toHaveURL(/species=Human/);
    await expect(page.getByText(/2\s*filters applied/)).toBeVisible();

    const cards = page.getByRole("link", { name: /Portrait of/ });
    await expect(cards.first()).toBeVisible();
    for (const card of await cards.all()) {
      await expect(card).toContainText("Human");
    }
  });
});

test.describe("Character detail page", () => {
  test("opening a character from the grid shows its full profile and episodes", async ({
    page,
  }) => {
    await page.goto("/characters");

    const firstCard = page.getByRole("link", { name: /Portrait of/ }).first();
    const characterName = await firstCard.locator("h3").innerText();
    await firstCard.click();

    await expect(page).toHaveURL(/\/characters\/\d+$/);
    await expect(
      page.getByRole("heading", { level: 2, name: characterName }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Episode appearances" }),
    ).toBeVisible();

    await page.getByRole("button", { name: "Back to characters" }).click();
    await expect(page).toHaveURL("/characters");
  });

  test("visiting a character id that doesn't exist shows a not-found state, not a crash", async ({
    page,
  }) => {
    // Visits /characters first so there's a real history entry for
    // BackLink's router.back() to return to -- landing on the not-found
    // page as the very first navigation would send "back" to about:blank.
    await page.goto("/characters");
    await page.goto("/characters/999999999");

    await expect(page.getByText("Character not found.")).toBeVisible();
    await page.getByRole("button", { name: "Back to characters" }).click();
    await expect(page).toHaveURL("/characters");
  });
});
