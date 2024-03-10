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
    const jobID = __ENV.JOB_ID || 'default'; // Fallback to 'default' if JOB_ID is not set
    const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, -4);

    // Navigate to the website
    await page.goto('https://www.frame.io', { waitUntil: 'load' });

    // Take a screenshot after the page is completely loaded
    await page.screenshot({ path: `/tmp/screenshot_${jobID}_${timestamp}.png` });

    console.log(`Screenshot saved with Job ID: ${jobID} and Timestamp: ${timestamp}`);

    await page.close();
}
