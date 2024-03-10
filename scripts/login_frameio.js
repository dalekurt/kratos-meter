import { browser } from 'k6/experimental/browser';

export const options = {
    scenarios: {
        ui: {
            executor: 'shared-iterations',
            vus: 1, // Define the number of VUs here
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

    await page.goto('https://www.frame.io', { waitUntil: 'networkidle' });
    // Ensure the page has loaded before taking a screenshot
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: `/tmp/screenshot_${jobID}_frameio_${timestamp}.png` });

    console.log(`Screenshot saved with Job ID: ${jobID} and Timestamp: ${timestamp}`);
    
    await page.close();
}
