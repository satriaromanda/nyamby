import { test, expect } from '@playwright/test';

test.describe('Jobs Directory', () => {
  test('Jobs page loads and displays filters', async ({ page }) => {
    await page.goto('http://localhost:3000/jobs');
    await page.waitForLoadState('networkidle');

    // Verify Title
    const title = page.getByRole('heading', { name: /Jelajahi/i });
    await expect(title).toBeVisible();

    // Search input
    const searchInput = page.getByPlaceholder(/Cari posisi/i);
    await expect(searchInput).toBeVisible();

    // Verify filter buttons
    await expect(page.getByRole('button', { name: /Semua Pekerjaan/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Pengembang Web/i })).toBeVisible();
    
    // Verify budget inputs exist
    await expect(page.getByPlaceholder('Min')).toBeVisible();
    await expect(page.getByPlaceholder('Max')).toBeVisible();
  });

  test('Jobs search filters trigger loading state or URL change', async ({ page }) => {
    await page.goto('http://localhost:3000/jobs');
    await page.waitForLoadState('networkidle');
    
    const searchInput = page.getByPlaceholder(/Cari posisi/i);
    await searchInput.fill('developer');
    
    // Changing filter to 'Web Dev'
    const webDevBtn = page.getByRole('button', { name: /Pengembang Web/i });
    await webDevBtn.click();
    
    // The URL should update with the category
    await expect(page).toHaveURL(/category=web_dev/);
    await expect(page).toHaveURL(/q=developer/);
  });
});
