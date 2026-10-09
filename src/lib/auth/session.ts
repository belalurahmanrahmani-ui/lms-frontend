import "server-only";
import { cookies } from "next/headers";
import { decodeJwt } from "./jwt";
import type { AuthResponse, AuthUser } from "@/types/auth";

const ACCESS_TOKEN_COOKIE = "lms_access_token";
const REFRESH_TOKEN_COOKIE = "lms_refresh_token";
const USER_COOKIE = "lms_user";

const secureCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export async function setAuthSession(auth: AuthResponse) {
  const cookieStore = await cookies();

  cookieStore.set(ACCESS_TOKEN_COOKIE, auth.accessToken, {
    ...secureCookieOptions,
    expires: new Date(auth.accessTokenExpiration),
  });

  cookieStore.set(REFRESH_TOKEN_COOKIE, auth.refreshToken, {
    ...secureCookieOptions,
    maxAge: 60 * 60 * 24 * 30, // ۳۰ روز
  });

  // اطلاعات غیرحساس (برای نمایش در UI مثل نام کاربر) — عمداً HttpOnly نیست
  cookieStore.set(
    USER_COOKIE,
    JSON.stringify({
      userId: auth.userId,
      fullName: auth.fullName,
      email: auth.email,
      role: auth.role,
    }),
    { ...secureCookieOptions, httpOnly: false, expires: new Date(auth.accessTokenExpiration) }
  );
}

export async function clearAuthSession() {
  const cookieStore = await cookies();
  cookieStore.delete(ACCESS_TOKEN_COOKIE);
  cookieStore.delete(REFRESH_TOKEN_COOKIE);
  cookieStore.delete(USER_COOKIE);
}

export async function getAccessToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(ACCESS_TOKEN_COOKIE)?.value ?? null;
}

export async function getRefreshToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(REFRESH_TOKEN_COOKIE)?.value ?? null;
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(USER_COOKIE)?.value;
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}