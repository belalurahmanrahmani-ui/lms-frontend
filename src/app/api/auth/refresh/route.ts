import { NextResponse } from "next/server";
import { apiFetch, ApiError } from "@/lib/api/client";
import { getRefreshToken, setAuthSession, clearAuthSession } from "@/lib/auth/session";
import type { AuthResponse } from "@/types/auth";

export async function POST() {
  const refreshToken = await getRefreshToken();

  if (!refreshToken) {
    return NextResponse.json({ message: "نشست منقضی شده است" }, { status: 401 });
  }

  try {
    const auth = await apiFetch<AuthResponse>("/Auth/refresh-token", {
      method: "POST",
      body: { refreshToken },
    });

    await setAuthSession(auth);

    return NextResponse.json({
      userId: auth.userId,
      fullName: auth.fullName,
      email: auth.email,
      role: auth.role,
    });
  } catch (error) {
    await clearAuthSession();
    const status = error instanceof ApiError ? error.status : 500;
    return NextResponse.json(
      { message: "نشست منقضی شده، لطفاً دوباره وارد شوید" },
      { status }
    );
  }
}