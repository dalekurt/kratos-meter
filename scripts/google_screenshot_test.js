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
    thresholds: {
        checks: ['rate==1.0'],
    },
};

export default async function () {
    const page = browser.newPage();
    const jobID = __ENV.JOB_ID;
    const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, -4);
    const screenshotFilename = `/tmp/screenshot_${jobID}_${timestamp}.png`;

    try {
        await page.goto('https://google.com/');
        await page.screenshot({ path: screenshotFilename });
        console.log(`Screenshot saved as ${screenshotFilename}`);
    } catch (error) {
        console.error(`Error: ${error}`);
    } finally {
        await page.close();
    }
}
