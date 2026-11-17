const { test, expect } = require('@playwright/test');

test('shopper can browse the storefront, add to cart and place a demo order', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /Big finds/i })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Shop by category' })).toBeVisible();
  await expect(page.locator('.product-card').first()).toBeVisible();
  await expect(page.locator('.product-card').nth(15)).toBeVisible();
  await page.screenshot({ path: 'test-results/faultkart-home.png', fullPage: true });

  await page.locator('.product-card').first().getByRole('button', { name: /Add to cart/i }).click();
  await expect(page.getByRole('status')).toContainText('Added to cart');
  await page.getByRole('button', { name: /Cart/ }).first().click();
  await expect(page.getByRole('heading', { name: 'Your shopping cart' })).toBeVisible();
  await page.getByRole('button', { name: /PLACE ORDER/i }).click();
  await expect(page.getByRole('heading', { name: 'Secure demo checkout' })).toBeVisible();

  await page.getByLabel('Full name').fill('Demo Customer');
  await page.getByLabel('Mobile number').fill('9876543210');
  await page.getByLabel('Address', { exact: true }).fill('123 Sample Road');
  await page.getByLabel('City').fill('Kolkata');
  await page.getByLabel('State').fill('West Bengal');
  await page.getByLabel('PIN code').fill('700001');
  await page.getByRole('button', { name: /PLACE DEMO ORDER/i }).click();
  await expect(page.getByText("It's officially on the list!")).toBeVisible();
  await page.screenshot({ path: 'test-results/faultkart-order-success.png', fullPage: true });
});

test('category browsing, search, product detail and wishlist work', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('navigation', { name: 'Departments' }).getByRole('button', { name: 'Electronics' }).click();
  await expect(page.getByRole('heading', { name: 'Electronics' })).toBeVisible();
  const cards = page.locator('.shop-grid .product-card');
  await expect(cards.first()).toBeVisible();
  await cards.first().locator('.product-cover-button').click();
  await expect(page.locator('.detail-prices strong')).toBeVisible();
  await page.getByRole('button', { name: 'Add to wishlist' }).click();
  await expect(page.getByRole('status')).toContainText('Saved to wishlist');
  await page.locator('.site-header').getByRole('button', { name: 'Wishlist', exact: true }).click();
  await expect(page.locator('.product-card').first()).toBeVisible();
  await page.getByRole('textbox', { name: 'Search the marketplace' }).fill('mouse');
  await page.getByRole('button', { name: 'Search products' }).click();
  await expect(page.getByRole('heading', { name: /Results for "mouse"/i })).toBeVisible();
  await expect(page.locator('.shop-grid .product-card').first()).toBeVisible();
  await page.screenshot({ path: 'test-results/faultkart-search.png', fullPage: true });
});
