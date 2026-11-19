// PKCE verifier and state are tab-local and discarded after one callback.
const KEY = "google-login-attempt";
const base64url = (bytes) => btoa(String.fromCharCode(...bytes)).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
export async function startGoogleLogin(start, returnTo, remember = true) {
  const verifier = base64url(crypto.getRandomValues(new Uint8Array(32)));
  const challenge = base64url(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier))));
  const { data } = await start({ code_challenge: challenge });
  const url = new URL(data.authorization_url);
  if (url.origin !== "https://accounts.google.com" || url.pathname !== "/o/oauth2/v2/auth" || !data.state) throw new Error("Invalid Google login configuration.");
  sessionStorage.setItem(KEY, JSON.stringify({ verifier, state: data.state, returnTo, remember, createdAt: Date.now() }));
  window.location.assign(url.href);
}
export function readGoogleCallback(search) {
  const params = new URLSearchParams(search);
  const raw = sessionStorage.getItem(KEY);
  sessionStorage.removeItem(KEY);
  let attempt;
  try { attempt = JSON.parse(raw); } catch { /* Rejected below. */ }
  if (!attempt || !attempt.state || params.getAll("state").length !== 1 || params.get("state") !== attempt.state
      || !Number.isFinite(attempt.createdAt) || Date.now() - attempt.createdAt > 600000 || Date.now() < attempt.createdAt) {
    throw new Error("Google login expired or did not start in this tab. Please try again.");
  }
  if (params.has("error")) throw new Error("Google login was cancelled. Please try again.");
  if (params.getAll("code").length !== 1 || !params.get("code")) throw new Error("Google did not return an authorization code.");
  return { payload: { code: params.get("code"), state: attempt.state, code_verifier: attempt.verifier }, returnTo: attempt.returnTo, remember: attempt.remember };
}
