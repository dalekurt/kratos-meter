import { browser } from 'k6/experimental/browser';

export const options = {
    scenarios: {
        ui: {
            executor: 'shared-iterations',
            vus: 1, // Correctly set the number of VUs here
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
    const email = __ENV.EMAIL; // Retrieved from environment variables
    const password = __ENV.PASSWORD; // Retrieved from environment variables
    const jobID = __ENV.JOB_ID; // Ensure JOB_ID is passed as an environment variable
    const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, -4);

    // Increased timeout for page navigation
    await page.goto('https://app.frame.io/login', { timeout: 60000 });
    await page.waitForSelector('input[name="email"]', { timeout: 60000 });
    
    // Take a screenshot of the login page
    await page.screenshot({ path: `/tmp/screenshot_${jobID}_loginPage_${timestamp}.png` });

    // Fill in the email and password fields and submit the form
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]'); // Adjust the selector to match the login button

    // Wait for navigation to the dashboard or subsequent page
    await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 60000 });

    // Take a screenshot after successful login
    await page.screenshot({ path: `/tmp/screenshot_${jobID}_afterLogin_${timestamp}.png` });

    console.log(`Screenshots saved with Job ID: ${jobID} and Timestamp: ${timestamp}`);
    
    await page.close();
}
