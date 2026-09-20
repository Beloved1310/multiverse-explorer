import { expect, test } from "@playwright/test";

test.describe("Socratic character-search recovery", () => {
  test("turns a near-miss name into a real, shareable character search", async ({
    page,
  }) => {
    await page.goto("/characters");

    await page.getByPlaceholder("Search characters…").fill("bird person");
    await expect(page).toHaveURL(/name=bird+person|name=bird%20person/);
    await expect(
      page.getByRole("heading", {
        name: "No one matches that search.",
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", {
        name: "No exact match. Let's try one detail.",
      }),
    ).toBeVisible();

    await page.getByRole("button", { name: /Birdperson, 1 match/ }).click();
    await expect(page).toHaveURL(/name=Birdperson/);
    await expect(
      page.getByRole("link", { name: /Portrait of Birdperson/ }),
    ).toBeVisible();
  });
});
