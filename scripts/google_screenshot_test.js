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
    // Generate a timestamp string in the format "YYYYMMDD_HHMMSS"
    const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, -4);
    // Prefix the filename with "screenshot" and append the timestamp
    const screenshotFilename = `screenshot_${timestamp}.png`;

    try {
        await page.goto('https://google.com/');
        try {
            // Use the dynamically generated filename for the screenshot
            await page.screenshot({ path: screenshotFilename });
            console.log(`Screenshot saved as ${screenshotFilename}`);
        } catch (screenshotError) {
            console.error(`Screenshot failed: ${screenshotError}`);
        }
    } catch (navigationError) {
        console.error(`Navigation failed: ${navigationError}`);
    } finally {
        await page.close();
    }
}
