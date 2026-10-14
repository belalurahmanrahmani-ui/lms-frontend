import { Tags } from "lucide-react";
import {
  AddCategoryButton,
  CategoryRowActions,
} from "@/components/category/CategoryActions";
import { apiFetchServer, ApiError } from "@/lib/api/server";
import type { Category } from "@/types/category";

export default async function AdminCategoriesPage() {
  let categories: Category[] = [];
  let errorMessage: string | null = null;

  try {
    categories = await apiFetchServer<Category[]>("/Category");
  } catch (error) {
    errorMessage =
      error instanceof ApiError ? error.message : "خطا در دریافت دسته‌بندی‌ها";
  }

  if (errorMessage) {
    return <p className="text-destructive">{errorMessage}</p>;
  }

  const sortedCategories = [...categories].sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl">Categories</h1>
        <AddCategoryButton />
      </div>

      <section className="rounded-2xl border border-border bg-card">
        {sortedCategories.length === 0 ? (
          <div className="flex flex-col items-center gap-3 p-12 text-center">
            <Tags className="h-8 w-8 text-muted-foreground" />
            <p className="text-muted-foreground">هنوز دسته‌بندی‌ای ساخته نشده است.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs uppercase text-muted-foreground">
                  <th className="px-5 py-3 font-medium">#</th>
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">Description</th>
                  <th className="px-5 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {sortedCategories.map((category, index) => (
                  <tr key={category.id} className="hover:bg-accent/40">
                    <td className="px-5 py-3 text-muted-foreground">{index + 1}</td>
                    <td className="px-5 py-3">{category.name}</td>
                    <td className="max-w-md px-5 py-3 text-muted-foreground">
                      <span className="line-clamp-2">
                        {category.description || "—"}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <CategoryRowActions category={category} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}