export type AppType = "user" | "admin";

export function getStoredToken(appType: AppType): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  if (appType === "admin") {
    return localStorage.getItem("token2") ?? sessionStorage.getItem("token2");
  }

  return localStorage.getItem("token");
}

export function clearAuthState(appType: AppType) {
  if (typeof window === "undefined") {
    return;
  }

  if (appType === "admin") {
    localStorage.removeItem("token2");
    localStorage.removeItem("admin");
    sessionStorage.removeItem("token2");
    return;
  }

  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

export function getTokenExpiryTime(token: string | null): number | null {
  if (!token) {
    return null;
  }

  try {
    const parts = token.split(".");
    const payload = parts[1];

    if (!payload) {
      return null;
    }

    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=");
    const decoded = JSON.parse(globalThis.atob(padded));

    if (typeof decoded.exp !== "number") {
      return null;
    }

    return decoded.exp * 1000;
  } catch {
    return null;
  }
}

export function isTokenExpired(token: string | null, now = Date.now()): boolean {
  const expiryTime = getTokenExpiryTime(token);

  if (expiryTime === null) {
    return false;
  }

  return now >= expiryTime;
}
