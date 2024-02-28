// google_screenshot_test.js
import { browser } from 'k6/experimental/browser';

export const options = {
    scenarios: {
        browser_test: {
            executor: 'browser',
            vus: 1,
            iterations: 1,
            browser: {
                type: 'chromium', // or 'firefox', depending on your needs and setup
            },
        },
    },
};

export default function () {
    const page = browser.newPage();
    page.goto('https://www.google.com/');
    page.screenshot({ path: '/tmp/screenshot_google.png', fullPage: true });
    page.close();
}
