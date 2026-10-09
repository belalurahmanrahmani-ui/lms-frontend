type BackendResult<T> = {
  ok: boolean;
  status: number;
  data: T | null;
  errorMessage: string | null;
};

export async function callBackend<T = unknown>(
  path: string,
    method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
  body?: unknown
): Promise<BackendResult<T>> {
  const response = await fetch(`/api/backend/${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();
  let data: unknown = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }

  const errorData = data as {
    message?: string;
    title?: string;
    errors?: Record<string, string[]>;
  } | null;

  const fieldErrors = errorData?.errors
    ? Object.values(errorData.errors).flat().join(" • ")
    : null;

  return {
    ok: response.ok,
    status: response.status,
    data: response.ok ? (data as T | null) : null,
    errorMessage: response.ok
      ? null
      : errorData?.message ?? fieldErrors ?? errorData?.title ?? "عملیات ناموفق بود",
  };
}