import { browser } from 'k6/experimental/browser';

export const options = {
    scenarios: {
        ui: {
            executor: 'shared-iterations',
            vus: 1,
            iterations: 1,
            vusMax: 1, // Define the maximum number of virtual users
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
    // Uncomment below if you want to block certain types of resources
    // await page.route('**/*.{png,jpg,jpeg,gif,css}', route => route.abort());

    try {
        await page.goto('https://www.frame.io', { waitUntil: 'networkidle', timeout: 60000 });

        // Take a screenshot of the page once it's fully loaded
        await page.screenshot({ path: `/tmp/screenshot_${jobID}_frameioComplete_${timestamp}.png` });

        console.log(`Screenshot of complete page load saved with Job ID: ${jobID} and Timestamp: ${timestamp}`);
    } catch (e) {
        console.error(`Test execution error: ${e}`);
    } finally {
        await page.close();
    }
}
