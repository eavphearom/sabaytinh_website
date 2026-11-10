import { extractLoginSession } from "./loginResponse.js";
import axios from "axios";

const apiBase = new URL(import.meta.env?.VITE_API_BASE_URL || "/", window.location.origin);
const client = axios.create({
  timeout: 15000,
  baseURL: import.meta.env?.VITE_AUTH_API_BASE_URL || `${apiBase.origin}/api/v1/auth`,
  headers: { Accept: "application/json", "Content-Type": "application/json" },
});
async function post(path, payload) {
  const { data } = await client.post(path, payload);
  if (data.error) throw new Error(data.message || "Unable to complete your request.");
  return data;
}
export default {
  login: async (credentials) => extractLoginSession(await post("/login", credentials)),
  register: (details) => post("/register", details),
  getCurrentUser: async (token, signal) => {
    const { data } = await client.get("/me", { signal, headers: { Authorization: `Bearer ${token}` } });
    if (data.error || !data.data) throw new Error(data.message || "Unable to verify your session.");
    return data.data;
  },
  logout: (token) => client.post("/logout", {}, { headers: { Authorization: `Bearer ${token}` } }),
};
