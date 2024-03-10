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
    
    try {
        await page.goto('https://app.frame.io/login', { timeout: 120000 }).catch(e => {
            console.error(`Failed to navigate: ${e}`);
            throw e; // Rethrow to ensure the script halts execution beyond this point if navigation fails
        });

        // Optionally wait for network to be idle to ensure all resources have loaded
        await page.waitForLoadState('networkidle').catch(e => {
            console.error(`Page load issue: ${e}`);
        });

        // Take a screenshot of the login page
        await page.screenshot({ path: `/tmp/screenshot_${jobID}_loginPage_${timestamp}.png` }).catch(e => {
            console.error(`Screenshot error: ${e}`);
        });

        console.log(`Screenshots saved with Job ID: ${jobID} and Timestamp: ${timestamp}`);
    } catch (e) {
        console.error(`Test execution error: ${e}`);
    } finally {
        await page.close();
    }
}
