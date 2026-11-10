import { useEffect, useState } from "react";
import AuthContext from "./AuthContext";
import authService from "../services/authService";
import {
  readSession,
  saveSession,
  clearSession,
  tokenExpiry,
} from "../services/authSession";

export default function AuthProvider({ children }) {
  const [session, setSession] = useState(readSession);
  const [verified, setVerified] = useState({
    token: null,
    user: null,
    error: "",
  });
  const [attempt, setAttempt] = useState(0);
  const token = session?.token;
  useEffect(() => {
    const sync = () => setSession(readSession());
    const expired = () => {
      clearSession();
      setSession(null);
      setVerified({ token: null, user: null, error: "" });
    };
    window.addEventListener("storage", sync);
    window.addEventListener("auth-expired", expired);
    const expiry = token ? tokenExpiry(token) : null;
    const timer =
      expiry != null && expiry - Date.now() <= 2147483647
        ? window.setTimeout(expired, Math.max(0, expiry - Date.now()))
        : null;
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("auth-expired", expired);
      if (timer != null) window.clearTimeout(timer);
    };
  }, [token]);
  useEffect(() => {
    if (!token) return;
    const controller = new AbortController();
    const verify = async () => {
      setVerified({ token: null, user: null, error: "" });
      try {
        const user = await authService.getCurrentUser(token, controller.signal);
        if (!controller.signal.aborted) setVerified({ token, user, error: "" });
      } catch (error) {
        if (controller.signal.aborted) return;
        if (error.response?.status === 401 || error.response?.status === 403) {
          clearSession();
          setSession(null);
          setVerified({ token: null, user: null, error: "" });
        } else {
          setVerified({
            token: null,
            user: null,
            error: "Unable to verify your session. Please try again.",
          });
        }
      }
    };
    verify();
    return () => controller.abort();
  }, [token, attempt]);
  const login = async (credentials, remember = true) => {
    // authService owns ApiResponse extraction; do not unwrap .data again.
    const { token, refreshToken, user } = await authService.login(credentials);
    setVerified({ token: null, user: null, error: "" });
    const nextSession = saveSession(token, user, remember, refreshToken);
    setSession(nextSession);
    return nextSession;
  };
  const logout = async () => {
    try {
      if (token) await authService.logout(token);
    } finally {
      clearSession();
      setSession(null);
      setVerified({ token: null, user: null, error: "" });
    }
  };
  return (
    <AuthContext.Provider
      value={{
        user: verified.user ?? session?.user,
        isAuthenticated: Boolean(token && verified.token === token),
        loading: Boolean(token && verified.token !== token && !verified.error),
        error: token ? verified.error : "",
        retry: () => setAttempt((value) => value + 1),
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
