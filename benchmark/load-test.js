import http from "k6/http";
import { check, sleep } from "k6";

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
        // { duration: '30s', target: 10000 },
        // { duration: '30s', target: 50000 },
        { duration: "30s", target: 0 },
      ],
    },
  },
};

export default function () {
  // http://localhost:8000/api/v1/workspaces/
  const res = http.get("http://localhost:8000/api/v1/workspaces", {
    headers: {
      Authorization:
        "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7InVzZXIiOnsiaWQiOjEsIm5hbWUiOiJBYXJhdiBTaGFybWEiLCJlbWFpbCI6ImFhcmF2QGVtYWlsLmNvbSJ9fSwiaWF0IjoxNzg5MDMwMDA1LCJleHAiOjE3ODkwMzM2MDV9.WmGewRlYnrRQZzDY5LtTrax3g2BeJWhFVzcha0JpKEY",
    },
  });

  check(res, {
    "status: 200": (r) => r.status === 200,
  });

  sleep(0.1);
}
