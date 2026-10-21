import { NextRequest, NextResponse } from "next/server";
import { refreshAuthSession } from "@/lib/auth/refresh";

// جلوگیری از Open Redirect: فقط مسیر داخلی همین سایت
function safeRedirectPath(value: string | null) {
  if (!value) return "/";
  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) {
    return "/";
  }
  return value;
}

// برای فراخوانی با Fetch
export async function POST() {
  const auth = await refreshAuthSession();

  if (!auth) {
    return NextResponse.json(
      { message: "نشست منقضی شده، لطفاً دوباره وارد شوید" },
      { status: 401 }
    );
  }

  return NextResponse.json({
    userId: auth.userId,
    fullName: auth.fullName,
    email: auth.email,
    role: auth.role,
  });
}

// برای Middleware: Refresh و بازگشت به همان صفحه
export async function GET(request: NextRequest) {
  const redirectTo = safeRedirectPath(request.nextUrl.searchParams.get("redirectTo"));
  const auth = await refreshAuthSession();

  if (!auth) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirectTo", redirectTo);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.redirect(new URL(redirectTo, request.url));
}