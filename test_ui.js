const { chromium } = require('playwright');

(async () => {
  console.log('Launching browser...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  console.log('Navigating to http://localhost:3000...');
  await page.goto('http://localhost:3000');
  await page.waitForLoadState('networkidle');
  
  // Take a screenshot of the initial state
  console.log('Taking initial screenshot...');
  await page.screenshot({ path: 'C:\\Users\\ACER\\.gemini\\antigravity-ide\\brain\\c1f335ce-a870-4bd8-a047-1b59550995f3\\scratch\\homepage_initial.png', fullPage: true });
  
  // Verify navbar elements exist
  console.log("Checking for Navbar elements...");
  const browseBtn = page.locator('button:has-text("Browse")');
  if (await browseBtn.count() > 0) {
      console.log("Browse button found!");
      await browseBtn.hover();
      await page.waitForTimeout(500); // wait for dropdown animation
      await page.screenshot({ path: 'C:\\Users\\ACER\\.gemini\\antigravity-ide\\brain\\c1f335ce-a870-4bd8-a047-1b59550995f3\\scratch\\dropdown_browse.png' });
  } else {
      console.log("Browse button NOT found!");
  }

  const fiturBtn = page.locator('button:has-text("Fitur")');
  if (await fiturBtn.count() > 0) {
      console.log("Fitur button found!");
      await fiturBtn.hover();
      await page.waitForTimeout(500); // wait for dropdown animation
      await page.screenshot({ path: 'C:\\Users\\ACER\\.gemini\\antigravity-ide\\brain\\c1f335ce-a870-4bd8-a047-1b59550995f3\\scratch\\dropdown_fitur.png' });
  } else {
      console.log("Fitur button NOT found!");
  }

  await browser.close();
  console.log("Test completed.");
})();
