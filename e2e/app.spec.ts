import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Video to GIF/i);
});

test('shows upload zone', async ({ page }) => {
  await page.goto('/');

  // Expect the upload zone to be visible
  await expect(page.getByText('Drop your video here')).toBeVisible();
});
