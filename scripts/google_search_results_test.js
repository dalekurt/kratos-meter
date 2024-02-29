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
        // Use the title attribute to accurately identify the search input
        const searchInput = page.locator('input[title="Search"]');
        await searchInput.fill('Best french restaurant for brunch in NYC');
        // Take a screenshot after filling the search input
        await page.screenshot({ path: `/tmp/screenshot_${jobID}_${timestamp}_before_search.png` });
        await searchInput.press('Enter'); // Simulate pressing Enter to submit the search
        await page.waitForLoadState('networkidle');
        // Take a screenshot after the search results have loaded
        await page.screenshot({ path: `/tmp/screenshot_${jobID}_${timestamp}_after_search.png` });
        // Optionally, take additional screenshots if needed for further interaction stages
        console.log(`Screenshots saved`);
    } catch (error) {
        console.error(`Error: ${error}`);
    } finally {
        await page.close();
    }
}
