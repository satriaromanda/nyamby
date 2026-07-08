import { test, expect } from '@playwright/test';

test.describe('Talents Directory', () => {
  test('Talents page loads and displays filters', async ({ page }) => {
    await page.goto('http://localhost:3000/talents');
    await page.waitForLoadState('networkidle');

    // Verify Title
    const title = page.getByRole('heading', { name: /Telusuri/i });
    await expect(title).toBeVisible();

    // Search input
    const searchInput = page.getByPlaceholder(/Cari nama, keahlian/i);
    await expect(searchInput).toBeVisible();

    // Verify filter buttons
    await expect(page.getByRole('button', { name: /Semua Talenta/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Pengembang Web/i })).toBeVisible();
    
    // Verify rate inputs exist
    await expect(page.getByPlaceholder('Min')).toBeVisible();
    await expect(page.getByPlaceholder('Max')).toBeVisible();
  });

  test('Talents search and filters update URL', async ({ page }) => {
    await page.goto('http://localhost:3000/talents');
    await page.waitForLoadState('networkidle');
    
    const searchInput = page.getByPlaceholder(/Cari nama, keahlian/i);
    await searchInput.fill('Budi');
    
    // Changing filter to 'Desainer Grafis'
    const designBtn = page.getByRole('button', { name: /Desainer Grafis/i });
    await designBtn.click();
    
    // The URL should update
    await expect(page).toHaveURL(/category=design/);
    await expect(page).toHaveURL(/q=Budi/);
  });
});
