import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { readGoogleCallback } from "../../services/googleLogin";
import { safeReturnPath } from "../../services/authSession";

export default function GoogleCallbackPage() {
  const { googleLogin } = useAuth();
  const navigate = useNavigate();
  const started = useRef(false);
  const [error, setError] = useState("");
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const search = window.location.search;
    // Remove authorization code before any subsequent navigation or referrer.
    window.history.replaceState(null, "", window.location.pathname);
    (async () => {
      try {
        const attempt = readGoogleCallback(search);
        await googleLogin(attempt.payload, attempt.remember);
        navigate(safeReturnPath(attempt.returnTo), { replace: true });
      } catch (failure) {
        setError(failure.response?.data?.message || failure.message || "Google login failed. Please try again.");
      }
    })();
  }, [googleLogin, navigate]);
  return <main className="flex min-h-screen items-center justify-center p-6">
    <div>{error ? <><p role="alert">{error}</p><Link to="/login" className="text-orange-600">Back to login</Link></>
      : <p role="status">Completing Google login?</p>}</div>
  </main>;
}
