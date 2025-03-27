import { test, expect } from '@playwright/test';

test.describe('Basic Route Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
  });

  test('should navigate to all main routes without errors', async ({ page }) => {
    // Check home page loads
    await expect(page).toHaveTitle(/Vite \+ React \+ TS/);
    
    // Navigate to Projects page
    await page.getByRole('link', { name: 'Projects' }).click();
    await expect(page).toHaveURL(/.*\/projects/);
    await expect(page.locator('h1')).toContainText('Test Projects');
    
    // Navigate to Run page
    await page.getByRole('link', { name: 'Run Tests' }).click();
    await expect(page).toHaveURL(/.*\/run/);
    
    // Navigate to History page
    await page.getByRole('link', { name: 'History' }).click();
    await expect(page).toHaveURL(/.*\/history/);
  });

  test('should handle invalid routes gracefully', async ({ page }) => {
    // Navigate to non-existent route
    await page.goto('http://localhost:5173/invalid-route');
    
    // Should show 404 message
    await expect(page.locator('.not-found')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Page Not Found' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Go to Home Page' })).toBeVisible();
  });

  test('should handle project details route with invalid ID', async ({ page }) => {
    // Navigate to project details with invalid ID
    await page.goto('http://localhost:5173/projects/invalid-id');
    
    // Should show error message without crashing
    await expect(page.locator('.error-message')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Error Loading Project' })).toBeVisible();
    await expect(page.getByText('Network Error')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Back to Projects' })).toBeVisible();
  });
}); 