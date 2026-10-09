import "server-only";
import { apiFetch, ApiError } from "@/lib/api/client";
import { getAccessToken } from "@/lib/auth/session";

export async function apiFetchServer<T>(
  endpoint: string,
  options: Parameters<typeof apiFetch>[1] = {}
): Promise<T> {
  const token = await getAccessToken();

  if (!token) {
    throw new ApiError("کاربر وارد نشده است", 401);
  }

  return apiFetch<T>(endpoint, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  });
}

export { ApiError };