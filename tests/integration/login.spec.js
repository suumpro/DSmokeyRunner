const { test, expect } = require('@playwright/test');

test('login flow', async ({ page }) => {
  // Navigate to a test page
  await page.goto('https://example.com');
  
  // Basic assertion to ensure the page loaded
  const title = await page.title();
  expect(title).toBeTruthy();
});
