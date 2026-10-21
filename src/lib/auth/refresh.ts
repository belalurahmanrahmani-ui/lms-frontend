import "server-only";
import { apiFetch, ApiError } from "@/lib/api/client";
import { clearAuthSession, getRefreshToken, setAuthSession } from "./session";
import type { AuthResponse } from "@/types/auth";

// درخواست‌های هم‌زمان با یک Refresh Token، یک Promise مشترک دارند
const inFlight = new Map<string, Promise<AuthResponse>>();

function requestNewTokens(refreshToken: string) {
  const existing = inFlight.get(refreshToken);
  if (existing) return existing;

  const promise = apiFetch<AuthResponse>("/Auth/refresh-token", {
    method: "POST",
    body: { refreshToken },
  }).finally(() => inFlight.delete(refreshToken));

  inFlight.set(refreshToken, promise);
  return promise;
}

export async function refreshAuthSession(): Promise<AuthResponse | null> {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) return null;

  try {
    const auth = await requestNewTokens(refreshToken);
    await setAuthSession(auth);
    return auth;
  } catch (error) {
    // فقط وقتی توکن واقعاً نامعتبر است Session پاک شود (نه هنگام خرابی موقت سرور)
    if (error instanceof ApiError && (error.status === 400 || error.status === 401)) {
      await clearAuthSession();
    }
    return null;
  }
}