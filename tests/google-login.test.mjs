import test from "node:test";
import assert from "node:assert/strict";
import { startGoogleLogin, readGoogleCallback } from "../src/services/googleLogin.js";
const store = new Map();
globalThis.sessionStorage = { getItem: k => store.get(k) ?? null, setItem: (k,v) => store.set(k,v), removeItem: k => store.delete(k) };
globalThis.window = { location: { assign: value => { window.destination = value; } } };
const start = async ({ code_challenge }) => {
  assert.match(code_challenge, /^[A-Za-z0-9_-]{43}$/);
  return { data: { state: "signed-state", authorization_url: "https://accounts.google.com/o/oauth2/v2/auth?state=signed-state" } };
};
test("start uses S256 and callback recovers tab-bound verifier exactly once", async () => {
  store.clear(); await startGoogleLogin(start, "/account/orders", false);
  const value = readGoogleCallback("?state=signed-state&code=google-code");
  assert.equal(value.returnTo, "/account/orders"); assert.equal(value.remember, false);
  assert.match(value.payload.code_verifier, /^[A-Za-z0-9_-]{43}$/);
  assert.equal(value.payload.code, "google-code");
  assert.throws(() => readGoogleCallback("?state=signed-state&code=google-code"));
});
test("rejects wrong state, missing state, duplicate state and missing code", async () => {
  for (const query of ["?state=wrong&code=x", "?code=x", "?state=signed-state&state=signed-state&code=x", "?state=signed-state"]) {
    store.clear(); await startGoogleLogin(start, "/account");
    assert.throws(() => readGoogleCallback(query));
  }
});
test("cancellation is safe and does not accept a code", async () => {
  store.clear(); await startGoogleLogin(start, "/account");
  assert.throws(() => readGoogleCallback("?state=signed-state&error=access_denied&code=x"), /cancelled/);
});
test("expired attempt is rejected", async () => {
  store.clear(); await startGoogleLogin(start, "/account");
  const value = JSON.parse(store.get("google-login-attempt")); value.createdAt -= 601000;
  store.set("google-login-attempt", JSON.stringify(value));
  assert.throws(() => readGoogleCallback("?state=signed-state&code=x"), /expired/);
});
test("never navigates to an unexpected provider URL", async () => {
  store.clear();
  await assert.rejects(startGoogleLogin(async () => ({ data: { state: "x", authorization_url: "https://attacker.invalid" } }), "/"));
  assert.equal(store.size, 0);
});
