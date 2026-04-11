/**
 * k6 ლოდ ტესტი — 100 ერთდროული ვირტუალური მომხმარებელი
 *
 * გაშვება:
 *   k6 run load-test.js
 *   k6 run -e BASE_URL=https://შენი-დომენი.ge load-test.js
 *
 * ლოკალურად (Next.js dev ჩვეულებრივ 3000 პორტზე):
 *   k6 run -e BASE_URL=http://localhost:3000 load-test.js
 */
import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = 'https://postifly.ge';

export const options = {
  vus: 200,
  duration: '1m',
  thresholds: {
    http_req_failed: ['rate<0.1'],
    http_req_duration: ['p(95)<5000'],
  },
};

export default function () {
  const res = http.get(`${BASE_URL}/`);
  check(res, {
    'სტატუსი 200': (r) => r.status === 200,
  });
  sleep(1);
}
