import { NextResponse } from "next/server";
import { apiFetch, ApiError } from "@/lib/api/client";
import { setAuthSession } from "@/lib/auth/session";
import type { AuthResponse } from "@/types/auth";

export async function POST(request: Request) {
  const body = await request.json();

  try {
    const auth = await apiFetch<AuthResponse>("/Auth/login", {
      method: "POST",
      body,
    });

    await setAuthSession(auth);

    return NextResponse.json({
      userId: auth.userId,
      fullName: auth.fullName,
      email: auth.email,
      role: auth.role,
    });
  } catch (error) {
    const status = error instanceof ApiError ? error.status : 500;
    const message =
      error instanceof ApiError ? error.message : "ایمیل یا رمز عبور اشتباه است";
    return NextResponse.json({ message }, { status });
  }
}