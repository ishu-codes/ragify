import http from "k6/http";
import { check, sleep } from "k6";

const BASE_URL = "http://localhost:8000";
const TOKEN = "";

export const options = {
  scenarios: {
    load_test: {
      executor: "ramping-vus",
      startVUs: 0,
      stages: [
        { duration: "30s", target: 10 },
        { duration: "30s", target: 50 },
        { duration: "30s", target: 100 },
        { duration: "30s", target: 200 },
        { duration: "30s", target: 500 },
        { duration: "30s", target: 1000 },
        { duration: "30s", target: 5000 },
        { duration: "30s", target: 5000 },
        // { duration: '30s', target: 10000 },
        // { duration: '30s', target: 50000 },
        { duration: "30s", target: 0 },
      ],
    },
  },
};

export default function () {
  // http://localhost:8000/api/v1/workspaces/
  const res = http.get(`${BASE_URL}/api/v1/workspaces`, {
    headers: {
      Authorization: `Bearer ${TOKEN}`,
    },
  });

  check(res, {
    "status: 200": (r) => r.status === 200,
  });

  sleep(0.1);
}
