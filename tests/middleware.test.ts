import test, { afterEach } from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { middleware } from "@/middleware";

const ENV_KEYS = ["APP_ENV", "STAGING_AUTH_USER", "STAGING_AUTH_PASS"] as const;
const saved: Record<string, string | undefined> = {};
for (const key of ENV_KEYS) saved[key] = process.env[key];

afterEach(() => {
  for (const key of ENV_KEYS) {
    if (saved[key] === undefined) delete process.env[key];
    else process.env[key] = saved[key];
  }
});

function configureStaging(user = "tester", pass = "p:ss") {
  process.env.APP_ENV = "staging";
  process.env.STAGING_AUTH_USER = user;
  process.env.STAGING_AUTH_PASS = pass;
}

function request(path: string, authorization?: string) {
  const headers: Record<string, string> = {};
  if (authorization !== undefined) headers.authorization = authorization;
  return new NextRequest(`http://staging.test${path}`, { headers });
}

function basic(user: string, pass: string) {
  return `Basic ${Buffer.from(`${user}:${pass}`).toString("base64")}`;
}

// NextResponse.next() marks pass-through responses with this header.
const isPassThrough = (res: Response) => res.headers.get("x-middleware-next") === "1";

test("staging blocks protected routes without credentials", () => {
  configureStaging();
  const res = middleware(request("/products"));
  assert.equal(res.status, 401);
  assert.match(res.headers.get("www-authenticate") ?? "", /Basic realm=/);
  assert.equal(res.headers.get("x-robots-tag"), "noindex, nofollow, noarchive");
});

test("staging blocks wrong username or password", () => {
  configureStaging("tester", "p:ss");
  assert.equal(middleware(request("/cart", basic("tester", "wrong"))).status, 401);
  assert.equal(middleware(request("/cart", basic("someone", "p:ss"))).status, 401);
  assert.equal(middleware(request("/cart", "Bearer abc")).status, 401);
  assert.equal(middleware(request("/cart", "Basic !!!not-base64")).status, 401);
});

test("staging accepts correct credentials, including a password containing a colon", () => {
  configureStaging("tester", "p:ss");
  const res = middleware(request("/products", basic("tester", "p:ss")));
  assert.ok(isPassThrough(res));
  assert.equal(res.headers.get("x-environment"), "staging");
  assert.equal(res.headers.get("x-robots-tag"), "noindex, nofollow, noarchive");
});

test("staging fails closed when credentials are not configured", () => {
  process.env.APP_ENV = "staging";
  delete process.env.STAGING_AUTH_USER;
  delete process.env.STAGING_AUTH_PASS;

  // Even the old default credentials must not open the site.
  const res = middleware(request("/products", basic("lonewolf", "staging2026")));
  assert.equal(res.status, 503);
});

test("public routes stay reachable in staging without credentials", () => {
  configureStaging();
  for (const path of ["/api/health", "/api/webhooks/payment", "/_next/static/x.js", "/favicon.ico"]) {
    const res = middleware(request(path));
    assert.ok(isPassThrough(res), `${path} should not require authentication`);
  }
});

test("outside staging, no basic auth is required and no staging headers are added", () => {
  process.env.APP_ENV = "production";
  const res = middleware(request("/products"));
  assert.ok(isPassThrough(res));
  assert.equal(res.headers.get("x-environment"), null);
});
