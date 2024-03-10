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
    const email = __ENV.EMAIL; // Make sure to pass the EMAIL as an environment variable when running the test
    const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, -4);

    await page.goto('https://app.frame.io/login');
    await page.waitForSelector('input[name="email"]', { timeout: 60000 });

    // Fill the email field
    await page.fill('input[name="email"]', email);

    // Take a screenshot after entering the email
    await page.screenshot({ path: `/tmp/screenshot_${jobID}_emailEntered_${timestamp}.png` });

    console.log(`Screenshot saved with Job ID: ${jobID} and Timestamp: ${timestamp}`);
    
    await page.close();
}
