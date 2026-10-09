import { CreateCourseForm } from "@/components/course/CreateCourseForm";
import { apiFetchServer, ApiError } from "@/lib/api/server";
import type { Category } from "@/types/category";

export default async function CreateCoursePage() {
  let categories: Category[] = [];
  let errorMessage: string | null = null;

  try {
    categories = await apiFetchServer<Category[]>("/Category");
  } catch (error) {
    errorMessage =
      error instanceof ApiError ? error.message : "خطا در دریافت دسته‌بندی‌ها";
  }

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl">Create Course</h1>

      {errorMessage ? (
        <p className="text-destructive">{errorMessage}</p>
      ) : (
        <CreateCourseForm categories={categories} />
      )}
    </div>
  );
}