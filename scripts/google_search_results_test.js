import { browser } from 'k6/experimental/browser';

export const options = {
    scenarios: {
        ui: {
            executor: 'shared-iterations',
            vus: 1,
            iterations: 1,
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
    const jobID = __ENV.JOB_ID; // Ensure JOB_ID is passed as an environment variable
    const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, -4);

    await page.goto('https://google.com/');
    await page.waitForSelector('textarea[title="Search"]');

    // Click the search box before typing
    await page.click('textarea[title="Search"]');

    // Use Type instead of Fill to simulate keyboard input
    await page.type('textarea[title="Search"]', 'Best french restaurant for brunch in NYC');
    
    // Take a screenshot after typing the search query
    await page.screenshot({ path: `/tmp/screenshot_${jobID}_query_${timestamp}.png` });
    
    // Press Enter to submit the form and wait for navigation
    await page.press('textarea[title="Search"]', 'Enter');
    await page.waitForNavigation({ waitUntil: 'networkidle' });
    
    // Take a screenshot of the search results
    await page.screenshot({ path: `/tmp/screenshot_${jobID}_results_${timestamp}.png` });

    console.log(`Screenshots saved with Job ID: ${jobID} and Timestamp: ${timestamp}`);
    
    await page.close();
}
