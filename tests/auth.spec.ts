import { test, expect, Page } from '@playwright/test';

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
    page.getByRole("button", { name: /Logout/i })
  ).toBeVisible();
}

test.describe("Login", () => {
  test("login page renders correctly", async ({ page }) => {
    await page.goto("/login");

    await expect(
      page.getByRole("heading", { name: /Login to Play/i })
    ).toBeVisible();

    await expect(page.getByPlaceholder("Email")).toBeVisible();
    await expect(page.getByPlaceholder("Password")).toBeVisible();

    await expect(
      page.getByRole("button", { name: /Login/i })
    ).toBeVisible();

    await expect(
      page.getByRole("link", {
        name: /Don't have an account\? Sign up/i,
      })
    ).toBeVisible();
  });

  test("user can log in", async ({ page }) => {
    await login(page);

    await expect(page).toHaveURL(/\/dashboard$/);

    await expect(
      page.getByRole("heading", { name: /Dashboard/i })
    ).toBeVisible();

    await expect(
      page.getByText(TEST_EMAIL)
    ).toBeVisible();
  });
});

test.describe("Signup", () => {
  test("signup page renders correctly", async ({ page }) => {
    await page.goto("/signup");

    await expect(
      page.getByRole("heading", { name: /Sign Up to Play/i })
    ).toBeVisible();

    await expect(page.getByPlaceholder("Email")).toBeVisible();
    await expect(page.getByPlaceholder("Password")).toBeVisible();

    await expect(
      page.getByRole("button", { name: /Sign Up/i })
    ).toBeVisible();

    await expect(
      page.getByRole("link", {
        name: /Already have an account\? Login/i,
      })
    ).toBeVisible();
  });
});

test.describe("Logout", () => {
  test("user can log out", async ({ page }) => {
    await login(page);

    await page.getByRole("button", { name: /Logout/i }).click();

    await expect(page).toHaveURL(/\/login$/);
  });
});