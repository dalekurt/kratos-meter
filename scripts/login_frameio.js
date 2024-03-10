import { browser } from 'k6/experimental/browser';

export const options = {
    scenarios: {
        ui: {
            executor: 'shared-iterations',
            vus: 1,
            iterations: 1,
            gracefulStop: '30s',
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

    try {
        await page.goto('https://www.frame.io', { waitUntil: 'networkidle', timeout: 120000 });
        // Additional waitForLoadState can be redundant but used here for demonstration
        await page.waitForLoadState('networkidle');
        await page.screenshot({ path: `/tmp/screenshot_${jobID}_frameio_${timestamp}.png` });

        console.log(`Screenshot saved with Job ID: ${jobID} and Timestamp: ${timestamp}`);
    } catch (error) {
        console.log(`An error occurred: ${error.message}`);
    } finally {
        await page.close();
    }
}
