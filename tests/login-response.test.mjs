import test from "node:test";
import assert from "node:assert/strict";
import axios from "axios";
import { extractLoginSession } from "../src/services/loginResponse.js";
import { saveSession, readSession, clearSession } from "../src/services/authSession.js";
const storage = () => {
  const map = new Map();
  return { getItem: key => map.get(key) ?? null, setItem: (key, value) => map.set(key, String(value)), removeItem: key => map.delete(key) };
};
globalThis.localStorage = storage();
globalThis.sessionStorage = storage();
globalThis.window = { location: { origin: "http://localhost" } };
const body = role => ({error: false, status: "OK", message: "Login successful", data: {
  id: 1, username: "phearom123", role, access_token: "test-access", refresh_token: "test-refresh",
}});
let reply;
const originalCreate = axios.create;
axios.create = () => ({post: async () => ({data: reply})});
const {default: service} = await import("../src/services/authService.js");
axios.create = originalCreate;

for (const role of ["USER", "ADMIN"]) {
  test(`${role}: Axios -> Flask wrapper -> session is unwrapped exactly once`, async () => {
    reply = body(role);
    const result = await service.login({email: "test@example.com", password: "dummy"});
    assert.equal(result.token, "test-access");
    assert.equal(result.refreshToken, "test-refresh");
    assert.equal(result.user.name, "phearom123");
    assert.equal(result.user.role, role);
    assert.equal(result.data, undefined);
  });
}
test("reject Axios responses, bare payloads and missing tokens at the extraction boundary", () => {
  for (const wrong of [{data: body("USER")}, body("USER").data, {}, null]) {
    assert.throws(() => extractLoginSession(wrong), /access token/);
  }
  const missing = body("USER"); delete missing.data.refresh_token;
  assert.throws(() => extractLoginSession(missing), /refresh token/);
});
test("backend failure is propagated without persisting credentials", async () => {
  reply = {error: true, message: "Invalid email or password"};
  await assert.rejects(service.login({}), /Invalid email or password/);
});
test("both tokens follow remember-me storage and are cleared on logout", () => {
  const {token, user, refreshToken} = extractLoginSession(body("USER"));
  for (const remember of [true, false]) {
    saveSession(token, user, remember, refreshToken);
    const target = remember ? localStorage : sessionStorage;
    const other = remember ? sessionStorage : localStorage;
    assert.equal(target.getItem("token"), token);
    assert.equal(target.getItem("refresh_token"), refreshToken);
    assert.equal(other.getItem("refresh_token"), null);
    assert.equal(readSession().refreshToken, refreshToken);
  }
  clearSession();
  assert.equal(readSession(), null);
  assert.equal(sessionStorage.getItem("refresh_token"), null);
  assert.equal(localStorage.getItem("refresh_token"), null);
});
