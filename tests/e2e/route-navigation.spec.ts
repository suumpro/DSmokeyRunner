import { test, expect } from '@playwright/test';

test.describe('Route Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/');
  });

  test('should navigate to all routes without crashing', async ({ page }) => {
    // Test home page
    await expect(page).toHaveTitle(/Smokey Runner/);

    // Test projects page
    await page.click('a[href="/projects"]');
    await expect(page).toHaveURL(/.*\/projects/);
    await expect(page.locator('h1')).toContainText('Test Projects');

    // Test run page
    await page.click('a[href="/run"]');
    await expect(page).toHaveURL(/.*\/run/);

    // Test history page
    await page.click('a[href="/history"]');
    await expect(page).toHaveURL(/.*\/history/);

    // Test project details page (assuming we have at least one project)
    await page.click('a[href="/projects"]');
    const projectCard = page.locator('.project-card').first();
    if (await projectCard.isVisible()) {
      await projectCard.click();
      await expect(page).toHaveURL(/.*\/projects\/[\w-]+/);
    }
  });

  test('should show error boundary for invalid routes', async ({ page }) => {
    await page.goto('http://localhost:5173/invalid-route');
    const errorBoundary = page.locator('.error-boundary');
    await expect(errorBoundary).toBeVisible();
    await expect(errorBoundary.locator('h2')).toContainText('Something went wrong');
  });

  test('should recover from errors using error boundary', async ({ page }) => {
    await page.goto('http://localhost:5173/invalid-route');
    const tryAgainButton = page.locator('.error-boundary button');
    await tryAgainButton.click();
    await expect(page).toHaveURL('http://localhost:5173/');
  });
}); 