export function tokenExpiry(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1].replaceAll("-", "+").replaceAll("_", "/")));
    return typeof payload.exp === "number" ? payload.exp * 1000 : null;
  } catch { return null; }
}
export function clearSession() {
  for (const storage of [localStorage, sessionStorage]) {
    storage.removeItem("token"); storage.removeItem("auth-user"); storage.removeItem("refresh_token");
  }
}
export function readSession() {
  try {
    const storage = localStorage.getItem("token") ? localStorage : sessionStorage;
    const token = storage.getItem("token");
    if (!token || (tokenExpiry(token) != null && tokenExpiry(token) <= Date.now())) return null;
    let user = null;
    try { user = JSON.parse(storage.getItem("auth-user")); } catch { /* Token can still be used. */ }
    return { token, user, refreshToken: storage.getItem("refresh_token") };
  } catch { return null; }
}
export function saveSession(token, user, remember, refreshToken = null) {
  clearSession();
  const storage = remember ? localStorage : sessionStorage;
  storage.setItem("auth-user", JSON.stringify(user));
  storage.setItem("token", token);
  if (refreshToken) storage.setItem("refresh_token", refreshToken);
  return { token, user, refreshToken: storage.getItem("refresh_token") };
}
export function safeReturnPath(path) {
  return typeof path === "string" && path.startsWith("/") && !path.startsWith("//")
    && !path.includes("\\") && !/^\/(login|register)(?:[/?#]|$)/.test(path) ? path : "/account";
}
