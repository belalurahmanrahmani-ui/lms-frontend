import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

type Role = "Admin" | "Teacher" | "Student";

const roleHomePath: Record<Role, string> = {
  Admin: "/admin/dashboard",
  Teacher: "/teacher/dashboard",
  Student: "/student/dashboard",
};

function getRequiredRole(pathname: string): Role | null {
  if (pathname.startsWith("/admin")) return "Admin";
  if (pathname.startsWith("/teacher")) return "Teacher";
  if (pathname.startsWith("/student")) return "Student";
  return null;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const userCookie = request.cookies.get("lms_user")?.value;
  const user = userCookie ? JSON.parse(userCookie) : null;

    const hasRefreshToken = Boolean(request.cookies.get("lms_refresh_token")?.value);
  const isAuthPage = pathname === "/login" || pathname === "/register";

  // Access Token منقضی شده ولی Refresh Token هنوز هست: به‌جای Logout، Session تازه شود
  if (!user && hasRefreshToken && !isAuthPage) {
    const refreshUrl = new URL("/api/auth/refresh", request.url);
    refreshUrl.searchParams.set("redirectTo", pathname + request.nextUrl.search);
    return NextResponse.redirect(refreshUrl);
  }


  const requiredRole = getRequiredRole(pathname);
  

  // تلاش برای ورود به صفحه محافظت‌شده بدون Login
  if (requiredRole && !user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // کاربر وارد شده ولی Role اشتباه (مثلاً Student در مسیر Admin)
  if (requiredRole && user && user.role !== requiredRole) {
    return NextResponse.redirect(new URL(roleHomePath[user.role as Role], request.url));
  }

  // کاربر وارد شده ولی می‌خواهد دوباره Login/Register ببیند
  if (isAuthPage && user) {
    return NextResponse.redirect(new URL(roleHomePath[user.role as Role], request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};