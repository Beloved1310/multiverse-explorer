import { expect, test } from "@playwright/test";

test.describe("Saved character filters", () => {
  test.beforeEach(async ({ page }) => {
    // Saved filters live in localStorage (see use-saved-character-filters.ts),
    // scoped per origin -- start each test from a clean slate rather than
    // depending on test order or a previous test's leftover state.
    await page.goto("/characters");
    await page.evaluate(() =>
      localStorage.removeItem("multiverse-explorer.saved-character-filters"),
    );
    await page.reload();
  });

  test("saving a filter persists it across a reload, reapplies it on click, and can be deleted", async ({
    page,
  }) => {
    await page.getByLabel("Dead").click();
    await expect(page).toHaveURL(/status=dead/);

    await page.getByPlaceholder("Name this search").fill("Fallen");
    await page.getByRole("button", { name: "Save search" }).click();

    // A plain <div aria-label>, not a form control -- getByLabel only
    // matches labelled form fields, so this needs the attribute directly.
    const savedSearches = page.locator('[aria-label="Saved searches"]');
    await expect(
      savedSearches.getByRole("button", { name: "Fallen", exact: true }),
    ).toBeVisible();

    // The whole point of using localStorage instead of component state --
    // this must survive a full reload, not just a re-render.
    await page.reload();
    await expect(
      savedSearches.getByRole("button", { name: "Fallen", exact: true }),
    ).toBeVisible();

    // Clear the filter, then use the saved search to bring it back.
    await page.getByRole("button", { name: "Clear all" }).click();
    await expect(page).not.toHaveURL(/status=dead/);

    await savedSearches
      .getByRole("button", { name: "Fallen", exact: true })
      .click();
    await expect(page).toHaveURL(/status=dead/);
    await expect(page.getByLabel("Dead")).toBeChecked();

    await page
      .getByRole("button", { name: "Delete saved search Fallen" })
      .click();
    await expect(
      savedSearches.getByRole("button", { name: "Fallen", exact: true }),
    ).toHaveCount(0);

    await page.reload();
    await expect(page.locator('[aria-label="Saved searches"]')).toHaveCount(0);
  });

  test("Save search is disabled without a name or with no active filters", async ({
    page,
  }) => {
    const saveButton = page.getByRole("button", { name: "Save search" });
    await expect(saveButton).toBeDisabled();

    await page.getByPlaceholder("Name this search").fill("Empty");
    await expect(saveButton).toBeDisabled();

    await page.getByPlaceholder("Name this search").fill("");
    await page.getByLabel("Alive").click();
    await expect(saveButton).toBeDisabled();

    await page.getByPlaceholder("Name this search").fill("Alive ones");
    await expect(saveButton).toBeEnabled();
  });
});
