const puppeteer = require('puppeteer');

(async () => {
  const userDataDir = 'BROWSER_DATA';
  const browser = await puppeteer.launch({
    headless: false, // Set to true if you want to run in headless mode
    userDataDir: userDataDir
  });
  const page = await browser.newPage();
  await page.goto('https://discourse.onlinedegree.iitm.ac.in/');
})();
