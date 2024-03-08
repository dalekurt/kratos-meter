import { sleep } from 'k6';
import http from 'k6/http';

export let options = {
    stages: [
        { duration: '1m', target: 10 }, // Simulate ramp-up of traffic from 1 to 10 users over 1 minute.
        { duration: '3m', target: 10 }, // Stay at 10 users for 3 minutes
        { duration: '1m', target: 0 },  // Ramp-down to 0 users
    ],
    thresholds: {
        'http_req_duration': ['p(99)<1500'], // 99% of requests must complete below 1.5s
    },
};

export default function () {
    const url = 'https://app.frame.io/auth/login'; // This URL is hypothetical and needs to be replaced with the actual login endpoint
    const payload = JSON.stringify({
        email: `${__ENV.EMAIL}`,
        password: `${__ENV.PASSWORD}`,
    });

    const params = {
        headers: {
            'Content-Type': 'application/json',
        },
    };

    let loginRes = http.post(url, payload, params);

    // Check login success and print a message. This part needs to be adjusted based on how the actual application responds to a login attempt.
    if (loginRes.status === 200) {
        console.log('Login successful');
    } else {
        console.error(`Login failed: ${loginRes.status}`);
    }

    sleep(1); // Sleep for 1 second before the next iteration.
}
