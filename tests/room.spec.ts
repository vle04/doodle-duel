import { test, expect, Page } from "@playwright/test";

const TEST_EMAIL = process.env.E2E_EMAIL!;
const TEST_PASSWORD = process.env.E2E_PASSWORD!;

// helper function to log in a user
async function login(page: Page) {
  await page.goto("/login");

  await page.getByPlaceholder("Email").fill(TEST_EMAIL);
  await page.getByPlaceholder("Password").fill(TEST_PASSWORD);
  await page.getByRole("button", { name: /Login/i }).click();

  await expect(page).toHaveURL(/\/dashboard$/);

  await expect(
    page.getByRole("button", { name: "Create Room" })
  ).toBeVisible();
}

// helper function to create a room
async function createRoom(page: Page) {
  await page.getByRole("button", {
    name: "Create Room",
  }).click();

  await expect(page).toHaveURL(/\/room\/.+$/);
}

test.describe("Room Flow", () => {
  test("user can create a room", async ({ page }) => {
    await login(page);
    await createRoom(page);

    console.log(await page.url());
    await page.screenshot({ path: "debug-dashboard.png" });

    await expect(
      page.getByRole("heading", { name: /Room/i })
    ).toBeVisible();
  });

  test("user can join Team A", async ({ page }) => {
    await login(page);
    await createRoom(page);

    await page.getByRole("button", { name: /Join Team A/i }).click();

    await expect(
      page.getByRole("heading", { name: "Team A" })
    ).toBeVisible();
  });

  test("user can join Team B", async ({ page }) => {
    await login(page);
    await createRoom(page);

    await page.getByRole("button", { name: /Join Team B/i }).click();

    await expect(
      page.getByRole("heading", { name: "Team B" })
    ).toBeVisible();
  });

  test("user can leave a room", async ({ page }) => {
    await login(page);
    await createRoom(page);

    await page.getByRole("button", { name: /Leave Room/i }).click();

    await expect(page).toHaveURL(/\/dashboard$/);
  });
});