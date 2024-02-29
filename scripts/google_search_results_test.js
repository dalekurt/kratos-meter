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

    try {
        await page.goto('https://google.com/');
        const searchInput = await page.getByLabel('Search');
        await searchInput.fill('Best french restaurant for brunch in NYC');
        await page.screenshot({ path: `/tmp/screenshot_${jobID}_${timestamp}.png` });
        await page.getByRole('button', { name: 'Search' }).click();
        await page.waitForLoadState('networkidle');
        await page.screenshot({ path: `/tmp/screenshot_${jobID}_${timestamp}.png` });
        console.log(`Screenshots saved`);
    } catch (error) {
        console.error(`Error: ${error}`);
    } finally {
        await page.close();
    }
}
