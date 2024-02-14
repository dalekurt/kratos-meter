// google_test.js
import { check } from 'k6';
import http from 'k6/http';

export default function () {
    let response = http.get("https://www.google.com/");
    check(response, {
        "is status 200": (r) => r.status === 200,
    });
}
