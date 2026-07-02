import { chromium } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

async function runTests() {
  console.log("Starting Playwright tests for Nyamby Cross-Border (Node.js)...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });
  const page = await context.newPage();

  try {
    // 1. Test Global Landing Page
    console.log("Navigating to /global...");
    await page.goto('http://localhost:3000/global');
    await page.waitForLoadState('networkidle');
    
    // Verify hero text
    const heroVisible = await page.locator("text=Hire Verified").isVisible();
    if (!heroVisible) throw new Error("Hero text missing");
    
    const badgeVisible = await page.locator("text=Now serving Malaysia").isVisible();
    if (!badgeVisible) throw new Error("Malaysia badge missing");
    
    console.log("✓ Landing page loaded successfully");
    await page.screenshot({ path: 'landing_global.png', fullPage: true });

    // 2. Go to Registration
    console.log("Navigating to Register...");
    await page.goto('http://localhost:3000/register?role=client&country=malaysia');
    await page.waitForLoadState('networkidle');
    
    if (!page.url().includes('/register')) {
      throw new Error(`Expected /register, got ${page.url()}`);
    }
    
    console.log("Filling registration form...");
    const timestamp = Math.floor(Date.now() / 1000);
    const testEmail = `client_${timestamp}@example.com`;
    
    // Step 1: Click "Saya Client" to move to form
    await page.click('text="Saya Client"');
    
    // Step 2: Fill form
    await page.waitForSelector('input[placeholder="Budi Santoso"]');
    await page.fill('input[placeholder="Budi Santoso"]', "Client Test Malaysia");
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', "Password123!");
    
    // Submit registration
    await page.click('button:has-text("Daftar & Mulai Hiring")');
    await page.waitForLoadState('networkidle');
    
    // 3. Onboarding
    console.log(`Current URL after register: ${page.url()}`);
    
    try {
      await page.waitForSelector('text="Informasi Perusahaan / Pribadi"', { timeout: 10000 });
      console.log("✓ Reached onboarding page");
    } catch (e) {
      console.log(`Failed to reach onboarding. Current URL: ${page.url()}`);
      await page.screenshot({ path: 'failed_onboarding_redirect.png' });
      throw e;
    }
    
    await page.screenshot({ path: 'onboarding_step1.png' });

    console.log("Selecting Malaysia in onboarding...");
    await page.click('button:has-text("Malaysia")');
    
    await page.click('button:has-text("Technology")');
    await page.fill('input[placeholder="e.g. Kuala Lumpur, Malaysia"]', "Kuala Lumpur, Malaysia");
    
    await page.click('button:has-text("Next")');
    
    // Step 2
    await page.waitForSelector('text="Profile Details"');
    await page.screenshot({ path: 'onboarding_step2.png' });
    
    console.log("Submitting onboarding step 2...");
    await page.click('button:has-text("Complete & Enter Dashboard")');
    await page.waitForLoadState('networkidle');
    
    console.log(`Current URL after onboarding: ${page.url()}`);
    try {
      await page.waitForSelector('text="Business verification"', { timeout: 5000 });
      console.log("✓ Reached dashboard with verification prompt");
    } catch (e) {
      console.log(`Did not find verification prompt. Current URL: ${page.url()}`);
    }
    
    await page.screenshot({ path: 'dashboard_verify.png', fullPage: true });

    console.log("Tests completed successfully!");
  } catch (error) {
    console.error("Test failed:", error);
    await page.screenshot({ path: 'error_screenshot.png' });
  } finally {
    await context.close();
    await browser.close();
  }
}

runTests();
