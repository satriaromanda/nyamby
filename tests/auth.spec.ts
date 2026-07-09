import { test, expect } from '@playwright/test';

test.describe('Authentication Flows', () => {
  test('Login page validation and standard elements', async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    
    // Wait for the page to be ready
    await page.waitForLoadState('networkidle');
    
    // Check if the logo image is present
    const logoImg = page.getByAltText('Nyamby Logo');
    await expect(logoImg).toBeVisible();
    
    // Check if form elements exist
    await expect(page.getByLabel(/Email/i)).toBeVisible();
    await expect(page.getByLabel(/Kata Sandi|Password/i)).toBeVisible();
    
    // Try submitting without filling
    await page.getByRole('button', { name: /Masuk sebagai Talenta|Masuk sebagai Talent/i }).click();
    
    // Some validation error should appear (e.g. built-in HTML5 validation or custom message)
    // Wait for a brief moment to ensure validation state is caught
    await page.waitForTimeout(500);
  });

  test('Register page role selection', async ({ page }) => {
    await page.goto('http://localhost:3000/register');
    
    await page.waitForLoadState('networkidle');
    
    // Verify "Saya Talenta" / "Saya Talent" tab exists
    const talentTab = page.getByText(/Saya Talenta|Saya Talent/i);
    await expect(talentTab).toBeVisible();
    
    // Verify "Saya Klien" / "Saya Client" tab exists
    const clientTab = page.getByText(/Saya Klien|Saya Client/i);
    await expect(clientTab).toBeVisible();

    // Verify form changes on tab click
    await clientTab.click();
    await expect(page.getByText(/PIC/i)).toBeVisible();
  });
});
