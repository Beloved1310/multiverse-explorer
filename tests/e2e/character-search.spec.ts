import { expect, test } from "@playwright/test";

test.describe("Character search and filters", () => {
  test("searching narrows the grid to matching characters, and Clear all resets it", async ({
    page,
  }) => {
    await page.goto("/");

    const cards = page.getByRole("link", { name: /Portrait of/ });
    await expect(cards.first()).toBeVisible();
    const fullCount = await cards.count();

    await page.getByPlaceholder("Search characters…").fill("rick");
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
    await page.goto("/");

    await page.getByLabel("Status").selectOption("dead");
    await expect(page).toHaveURL(/status=dead/);
    await expect(page.getByText("1", { exact: true })).toBeVisible();

    const cards = page.getByRole("link", { name: /Portrait of/ });
    await expect(cards.first()).toBeVisible();

    for (const card of await cards.all()) {
      await expect(card.getByText("Dead")).toBeVisible();
    }
  });
});

test.describe("Character detail page", () => {
  test("opening a character from the grid shows its full profile and episodes", async ({
    page,
  }) => {
    await page.goto("/");

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

    await page.getByRole("button", { name: "Back to the multiverse" }).click();
    await expect(page).toHaveURL("/");
  });
});
