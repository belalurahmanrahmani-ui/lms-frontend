import { NextRequest, NextResponse } from "next/server";
import { getAccessToken } from "@/lib/auth/session";
import { refreshAuthSession } from "@/lib/auth/refresh";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function handler(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const targetUrl = `${API_URL}/${path.join("/")}${request.nextUrl.search}`;

  // Body فقط یک بار خوانده می‌شود تا در صورت تکرار درخواست هم قابل استفاده باشد
  const body =
    request.method !== "GET" && request.method !== "DELETE"
      ? await request.text()
      : undefined;

  function callBackend(token: string) {
    return fetch(targetUrl, {
      method: request.method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body,
    });
  }

  // Cookie توکن منقضی شده؟ اول Refresh
  let token = await getAccessToken();
  if (!token) {
    token = (await refreshAuthSession())?.accessToken ?? null;
  }
  if (!token) {
    return NextResponse.json({ message: "وارد نشده‌اید" }, { status: 401 });
  }

  let backendResponse = await callBackend(token);

  // Backend توکن را رد کرد؟ یک بار Refresh و تکرار
  if (backendResponse.status === 401) {
    const refreshed = await refreshAuthSession();
    if (refreshed) {
      backendResponse = await callBackend(refreshed.accessToken);
    }
  }

  if (backendResponse.status === 204) {
    return new NextResponse(null, { status: 204 });
  }

  const data = await backendResponse.text();

  return new NextResponse(data, {
    status: backendResponse.status,
    headers: { "Content-Type": "application/json" },
  });
}

export {
  handler as GET,
  handler as POST,
  handler as PUT,
  handler as DELETE,
  handler as PATCH,
};