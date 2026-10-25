export async function api(path, { method = "GET", body, token } = {}) {
  // use the saved login automatically if no token is passed
  let authToken = token;
  if (!authToken) {
    try {
      authToken = JSON.parse(localStorage.getItem("user"))?.token;
    } catch {
      /* ignore */
    }
  }

  const res = await fetch(path, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    /* empty response */
  }

  if (!res.ok) {
    if (path.includes("/auth/login") && res.status === 401) {
      throw new Error("Wrong email or password");
    }
    if (res.status === 401 || res.status === 403) {
      throw new Error("Please log in again to continue");
    }
    throw new Error(data?.message || data?.error || `Request failed (${res.status})`);
  }
  return data;
}