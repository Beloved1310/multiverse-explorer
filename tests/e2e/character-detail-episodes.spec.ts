import { expect, test } from "@playwright/test";

test.describe("Character detail: paginated, season-grouped episodes", () => {
  test("navigates a season's episodes with next/previous, and collapsing keeps the current page cached instead of resetting or refetching", async ({
    page,
  }) => {
    // Character 1 (Rick Sanchez) is a stable fact of this dataset, live
    // or the checked-in snapshot: 11 episodes in season 1 alone -- 3
    // pages at the per-season page size (5) -- so next/previous are
    // guaranteed to appear without depending on exact catalogue counts
    // elsewhere.
    await page.goto("/characters/1");

    await expect(
      page.getByRole("heading", { level: 1, name: "Rick Sanchez" }),
    ).toBeVisible();

    const season1 = page.getByRole("button", { name: /Season 1/ });
    await expect(season1).toHaveAttribute("aria-expanded", "true");
    await expect(page.getByText("Pilot")).toBeVisible();
    await expect(page.getByText("Page 1 of 3")).toBeVisible();

    // Nothing to go back to on the first page.
    await expect(
      page.getByRole("button", { name: "Previous page" }),
    ).toHaveCount(0);

    const nextPage = page.getByRole("button", { name: "Next page" });
    await nextPage.click();

    // A page replaces the previous one -- it doesn't accumulate.
    await expect(page.getByText("Rick Potion #9")).toBeVisible();
    await expect(page.getByText("Pilot")).not.toBeVisible();
    await expect(page.getByText("Page 2 of 3")).toBeVisible();

    await nextPage.click();
    // Season 1 has exactly 11 episodes (5 + 5 + 1): page 3 is the last.
    await expect(page.getByText("Ricksy Business")).toBeVisible();
    await expect(page.getByText("Rick Potion #9")).not.toBeVisible();
    await expect(page.getByText("Page 3 of 3")).toBeVisible();
    await expect(nextPage).toHaveCount(0);

    const prevPage = page.getByRole("button", { name: "Previous page" });
    await prevPage.click();
    // Reads page 2 back from cache, not a fresh request for it.
    await expect(page.getByText("Rick Potion #9")).toBeVisible();
    await expect(page.getByText("Ricksy Business")).not.toBeVisible();

    // Collapsing and re-expanding must not lose the current page or
    // reset back to page 1 -- the panel stays mounted, just hidden.
    await season1.click();
    await expect(page.getByText("Rick Potion #9")).not.toBeVisible();
    await season1.click();
    await expect(page.getByText("Rick Potion #9")).toBeVisible();
    await expect(page.getByText("Page 2 of 3")).toBeVisible();
  });

  test("each season gets its own independent next/previous state", async ({
    page,
  }) => {
    await page.goto("/characters/1");

    // Season 1 is already auto-expanded on page 1 of 3, so it has a
    // "Next page" control before season 5 is touched at all.
    await expect(page.getByRole("button", { name: "Next page" })).toHaveCount(
      1,
    );

    // Season 5 has 10 episodes -- 2 pages. Expanding it must add a
    // second, independent "Next page" rather than reusing season 1's.
    await page.getByRole("button", { name: /Season 5/ }).click();
    await expect(page.getByRole("button", { name: "Next page" })).toHaveCount(
      2,
    );

    // Paging season 5 forward must not affect season 1's page.
    await page.getByRole("button", { name: "Next page" }).last().click();
    await expect(page.getByText("Pilot")).toBeVisible();
    await expect(page.getByText("Page 1 of 3")).toBeVisible();
  });
});
