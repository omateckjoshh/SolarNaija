import { test, expect } from '@playwright/test';

test('complete checkout and land on /thank-you with order summary', async ({ page }) => {
  // Seed localStorage with a cart item
  await page.addInitScript(() => {
    const cart = [{ id: 101, name: 'Test Panel', price: 25000, image: '', quantity: 1 }];
    localStorage.setItem('solarnaleja-cart', JSON.stringify(cart));
  });

  // Go to checkout directly
  await page.goto('/checkout');

  // Fill customer info
  await page.fill('input[name="name"]', 'Test User');
  await page.fill('input[name="email"]', 'test@example.com');
  await page.fill('input[name="phone"]', '+2348012345678');
  await page.fill('textarea[name="address"]', '123 Test Street');

  // Instead of invoking Paystack iframe, we simulate successful payment by
  // calling the page's global function that Checkout uses to handle success.
  // The Checkout component defines an internal async function `handlePaymentSuccess`
  // but it's not exposed; as a pragmatic approach for e2e we will intercept
  // window.PaystackPop to call the callback directly.

  // Stub PaystackPop.setup to immediately call callback with a fake reference.
  await page.evaluate(() => {
    (window as any).PaystackPop = {
      setup: (opts: any) => {
        return {
          openIframe: () => {
            // simulate success callback after short timeout
            setTimeout(() => {
              try {
                opts.callback({ reference: 'TEST-REF-12345' });
              } catch (e) {
                // ignore
              }
            }, 200);
          }
        };
      }
    };
  });

  // Click pay button
  await page.click('button:has-text("Pay with Paystack")');

  // Wait for navigation to /thank-you
  await page.waitForURL('**/thank-you', { timeout: 10000 });

  // Assert order summary is visible and contains our item and total
  await expect(page.locator('text=Thank you for your order!')).toBeVisible();
  await expect(page.locator('text=Test Panel')).toBeVisible();
  await expect(page.locator('text=₦25,000')).toBeVisible();
});
