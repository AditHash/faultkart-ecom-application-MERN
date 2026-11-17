const { test, expect } = require('@playwright/test');

async function login(page, name = 'Demo Shopper') {
  await page.goto('/#/login?mode=signup');
  await page.getByLabel('Your name').fill(name);
  await page.getByLabel('Enter Mobile number').fill('9876543210');
  await page.getByRole('button', { name: 'Request OTP' }).click();
  await page.getByLabel('One-time password').fill('123456');
  await page.getByRole('button', { name: 'Verify' }).click();
  await expect(page.getByRole('status')).toContainText('Welcome, ' + name);
}

test('signed-in shopper saves an address, checks out and tracks then cancels the order', async ({ page }) => {
  await login(page);
  await page.goto('/#/account/addresses');
  await page.getByRole('button', { name: 'ADD A NEW ADDRESS' }).click();
  await page.getByLabel('Full name').fill('Demo Shopper');
  await page.getByLabel('Mobile number').fill('9876543210');
  await page.getByLabel('PIN code').fill('700053');
  await page.getByLabel('Address', { exact: true }).fill('12 Sample Lane');
  await page.getByLabel('City').fill('Kolkata');
  await page.getByLabel('State').fill('West Bengal');
  await page.getByRole('button', { name: 'SAVE', exact: true }).click();
  await expect(page.getByText('12 Sample Lane')).toBeVisible();

  await page.goto('/#/shop?category=Books');
  await page.locator('.shop-grid .product-card').first().getByRole('button', { name: /Add to cart/i }).click();
  await expect(page.getByRole('status')).toContainText('Added to cart');
  await page.goto('/#/checkout');
  await expect(page.getByText('12 Sample Lane')).toBeVisible();
  await page.getByText('UPI', { exact: true }).click();
  await page.getByRole('button', { name: /PLACE DEMO ORDER/i }).click();
  await expect(page.getByText("It's officially on the list!")).toBeVisible();

  await page.getByRole('button', { name: 'Track order' }).click();
  await expect(page.locator('.tracker li').first()).toContainText('Order confirmed');
  await page.getByRole('button', { name: /Cancel order/ }).click();
  await expect(page.getByRole('status')).toContainText('Order cancelled');
  await expect(page.locator('.tracker')).toContainText('Cancelled');
  await page.screenshot({ path: 'test-results/faultkart-order-tracking.png', fullPage: true });
});

test('cart supports save for later and moving items back', async ({ page }) => {
  await page.goto('/#/shop?category=Toys');
  await page.locator('.shop-grid .product-card').first().getByRole('button', { name: /Add to cart/i }).click();
  await expect(page.getByRole('status')).toContainText('Added to cart');
  await page.goto('/#/cart');
  await page.getByRole('button', { name: 'Save for later' }).click();
  await expect(page.getByRole('heading', { name: /Saved For Later \(1\)/ })).toBeVisible();
  await page.getByRole('button', { name: 'Move to cart' }).click();
  await expect(page.getByRole('heading', { name: /Your shopping cart/ })).toBeVisible();
});

test('search suggestions, product reviews and delivery estimate', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('textbox', { name: 'Search the marketplace' }).fill('galax');
  const suggestions = page.getByRole('listbox', { name: 'Search suggestions' });
  await expect(suggestions).toBeVisible();
  await suggestions.getByRole('button').first().click();
  await page.locator('.shop-grid .product-cover-button').first().click();
  await page.getByLabel('Check delivery pincode').fill('700053');
  await page.getByRole('button', { name: 'Check', exact: true }).click();
  await expect(page.locator('.delivery-result')).toContainText('Delivery by');
  await page.getByRole('button', { name: 'Rate Product' }).click();
  await page.getByRole('radio', { name: '5 star' }).click();
  await page.getByLabel('Review title').fill('Great demo phone');
  await page.getByLabel('Your review').fill('Battery lasts all day in this simulated world.');
  await page.getByRole('button', { name: 'Submit review' }).click();
  await expect(page.locator('.review', { hasText: 'Your review' })).toContainText('Great demo phone');
});

test('account rewards, gift cards, seller, help and travel modules', async ({ page }) => {
  await login(page, 'Rewards Tester');
  await page.goto('/#/account/giftcards');
  await page.getByLabel('Gift card code').fill('WELCOME250');
  await page.getByRole('button', { name: 'Add gift card' }).click();
  await expect(page.locator('.coin-hero')).toContainText('₹250');
  await page.goto('/#/account/coins');
  await expect(page.locator('.coin-hero')).toContainText('50');
  await page.goto('/#/account/notifications');
  await expect(page.locator('.notification').first()).toContainText('Gift card added');

  await page.goto('/#/seller');
  await page.getByLabel('Business name').fill('Demo Traders');
  await page.getByLabel('Contact person').fill('Demo Owner');
  await page.getByLabel('Business email').fill('owner@example.test');
  await page.getByLabel('Seller mobile').fill('9123456780');
  await page.getByRole('button', { name: 'Start selling' }).click();
  await expect(page.locator('.ticket')).toContainText('Demo Traders');

  await page.goto('/#/help');
  await page.getByLabel('Describe the issue').fill('Where is my demo parcel?');
  await page.getByRole('button', { name: 'Submit' }).click();
  await expect(page.locator('.ticket').first()).toContainText('Where is my demo parcel?');

  await page.goto('/#/travel');
  await page.locator('.flight-form').getByRole('button', { name: 'Search' }).click();
  await page.locator('.flight').first().getByRole('button', { name: 'Book' }).click();
  await expect(page.getByRole('status')).toContainText('PNR');
  await page.screenshot({ path: 'test-results/faultkart-travel.png', fullPage: true });
});
