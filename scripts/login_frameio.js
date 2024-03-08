import { browser } from 'k6/experimental/browser';

export const options = {
    scenarios: {
        ui: {
            executor: 'shared-iterations',
            vus: 1,
            iterations: 1,
            vusMax: 1, // Ensuring only 1 virtual user
            options: {
                browser: {
                    type: 'chromium',
                },
            },
        },
    },
};

export default async function () {
    const page = browser.newPage();
    const email = __ENV.EMAIL; 
    const password = __ENV.PASSWORD;
    const jobID = __ENV.JOB_ID; 
    const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, -4);

    // Increased timeout for page navigation
    await page.goto('https://app.frame.io/login', { timeout: 60000 });
    await page.waitForSelector('input[name="email"]', { timeout: 60000 });

    await page.screenshot({ path: `/tmp/screenshot_${jobID}_loginPage_${timestamp}.png` });

    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]');
    
    await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 60000 });

    await page.screenshot({ path: `/tmp/screenshot_${jobID}_afterLogin_${timestamp}.png` });

    console.log(`Screenshots saved with Job ID: ${jobID} and Timestamp: ${timestamp}`);
    
    await page.close();
}
