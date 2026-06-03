import { test, expect } from '@playwright/test';

test.describe('Recent UI Changes', () => {
  test('Homepage should not have "Lihat Demo" buttons', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    
    // Wait for the page to be ready
    await page.waitForLoadState('networkidle');
    
    // Check if "Lihat Demo" is gone
    const demoButton = page.getByRole('link', { name: 'Lihat Demo' });
    await expect(demoButton).toHaveCount(0);
  });

  test('Login page should have the logo and correct structure', async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    
    // Wait for the page to be ready
    await page.waitForLoadState('networkidle');
    
    // Check if the logo image is present
    const logoImg = page.getByAltText('Nyamby');
    await expect(logoImg).toBeVisible();
    await expect(logoImg).toHaveAttribute('src', /logo-full\.png/);
    
    // Check if "Masuk ke Nyamby" is present
    const heading = page.getByRole('heading', { name: 'Masuk ke Nyamby' });
    await expect(heading).toBeVisible();
  });
});
