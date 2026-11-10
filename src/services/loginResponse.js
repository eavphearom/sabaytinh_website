// Accept the Flask ApiResponse body, never the Axios response or a bare user.
export function extractLoginSession(body) {
  if (body?.error) throw new Error(body.message || "Login failed.");
  const data = body?.data;
  if (typeof data?.access_token !== "string" || !data.access_token.trim()) {
    throw new Error("The login response did not include an access token.");
  }
  if (typeof data?.refresh_token !== "string" || !data.refresh_token.trim()) {
    throw new Error("The login response did not include a refresh token.");
  }
  return {
    token: data.access_token,
    refreshToken: data.refresh_token,
    user: { id: data.id, name: data.username, email: data.email, role: data.role },
  };
}
