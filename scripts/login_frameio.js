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

    // Optionally block images and CSS for faster loading if not needed for the screenshot
    // await page.route('**/*.{png,jpg,jpeg,gif,css}', route => route.abort());

    try {
        await page.goto('https://www.frame.io', { waitUntil: 'domcontentloaded', timeout: 60000 });

        // Adjust the timeout value based on expected page load times
        // and potentially retry logic for robustness
        
        // Take a screenshot of the page once it's loaded
        await page.screenshot({ path: `/tmp/screenshot_${jobID}_frameio_${timestamp}.png` });

        console.log(`Screenshot saved with Job ID: ${jobID} and Timestamp: ${timestamp}`);
    } catch (e) {
        console.error(`Test execution error: ${e}`);
    } finally {
        await page.close();
    }
}
