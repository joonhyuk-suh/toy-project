import { expect, test } from "@playwright/test";

test("홈 화면이 열리고 음식으로 찾기로 갈 수 있다", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle("향 아카이브");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("좋아하는 맛에서");
  await page.getByRole("link", { name: "음식으로 찾기" }).first().click();
  await expect(page).toHaveURL(/\/food$/);
});
