const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

async function clearAuthenticationCookie() {
  await fetch(`${apiBaseUrl}/api/auth/logout`, {
    method: "POST",
    credentials: "include",
  });
}

export async function authFetch(url, options = {}) {
  const { redirectOnUnauthorized = true, ...requestOptions } = options;
  const response = await fetch(url, {
    ...requestOptions,
    credentials: "include",
  });

  if (response.status === 401 && redirectOnUnauthorized && typeof window !== "undefined") {
    try {
      await clearAuthenticationCookie();
    } finally {
      window.location.assign("/login");
    }
  }

  return response;
}

export { apiBaseUrl };
