import { test, expect } from '@playwright/test';

test('homepage renders the starter content', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle(/Create Next App/);
  await expect(page.getByRole('heading', { name: /To get started/i })).toBeVisible();
  await expect(page.getByRole('link', { name: /Documentation/i })).toBeVisible();
});
