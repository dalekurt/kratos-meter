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
  const jobID = __ENV.JOB_ID || 'default'; // Fallback to 'default' if JOB_ID is not set
  const email = __ENV.EMAIL;
  const password = __ENV.PASSWORD;
  const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, -4);

 // Navigate to the page
 await page.goto('http://localhost:3001');

 // Take an initial screenshot
 await page.screenshot({ path: `/tmp/screenshot_${jobID}_before_${timestamp}.png` });

 // Fill in the email and password fields
 await page.fill('input[type=email]', email);
 await page.fill('input[type=password]', password);

 // Take a screenshot after filling in the form
 await page.screenshot({ path: `/tmp/screenshot_${jobID}_afterFill_${timestamp}.png` });

 // Submit the form and wait for network idle to ensure all requests are finished
 await Promise.all([
  page.waitForNavigation({ waitUntil: 'networkidle' }),
  page.click('button[type=submit]'),
]);

 // Take a screenshot after submission
 await page.screenshot({ path: `/tmp/screenshot_${jobID}_afterSubmit_${timestamp}.png` });

 // Close the browser page
 await page.close();
}
