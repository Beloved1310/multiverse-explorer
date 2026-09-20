import { expect, test } from "@playwright/test";

test.describe("Saved character filters", () => {
  test("asks anonymous visitors to sign in instead of storing a private search in the browser", async ({
    page,
  }) => {
    await page.goto("/characters");

    await expect(page.getByRole("link", { name: "Sign in" })).toHaveAttribute(
      "href",
      "/sign-in?next=/characters",
    );
    await expect(page.getByPlaceholder("Name this search")).toHaveCount(0);
    await expect(page.locator('[aria-label="Saved searches"]')).toHaveCount(0);
  });

  test("preserves the portable character-filter URL before sign-in", async ({
    page,
  }) => {
    await page.goto("/characters");
    await page.getByLabel("Dead").click();
    await expect(page).toHaveURL(/status=dead/);

    await page.getByRole("link", { name: "Sign in" }).click();
    await expect(page).toHaveURL(/\/sign-in\?next=\/characters/);
  });
});
