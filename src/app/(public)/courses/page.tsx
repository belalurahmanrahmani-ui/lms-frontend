import { apiFetch, ApiError } from "@/lib/api/client";

export default async function CoursesPage() {
  let data: unknown = null;
  let errorMessage: string | null = null;

  try {
    data = await apiFetch<unknown>("/Course");
  } catch (error) {
    if (error instanceof ApiError) {
      errorMessage = `API Error (${error.status}): ${error.message}`;
    } else if (error instanceof Error) {
      errorMessage = `Network/Fetch Error: ${error.message}`;
    } else {
      errorMessage = "Unknown error";
    }
  }

  if (errorMessage) {
    return <div className="p-6 text-destructive">{errorMessage}</div>;
  }

  return (
    <pre className="overflow-auto p-6 text-xs">
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}