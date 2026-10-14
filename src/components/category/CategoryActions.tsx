"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/shared/Modal";
import { CategoryForm } from "@/components/category/CategoryForm";
import { callBackend } from "@/lib/api/browser";
import type { Category } from "@/types/category";

const iconButton =
  "rounded-md p-1.5 transition-colors hover:bg-accent disabled:opacity-50";

export function AddCategoryButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button size="sm" onClick={() => setIsOpen(true)}>
        <Plus className="h-4 w-4" />
        Add Category
      </Button>

      {isOpen && (
        <Modal title="Add Category" onClose={() => setIsOpen(false)}>
          <CategoryForm mode="create" onDone={() => setIsOpen(false)} />
        </Modal>
      )}
    </>
  );
}

export function CategoryRowActions({ category }: { category: Category }) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    if (!window.confirm(`دسته‌بندی «${category.name}» حذف شود؟`)) return;

    setError(null);
    setIsLoading(true);

    const result = await callBackend(`Category/${category.id}`, "DELETE");

    setIsLoading(false);

    if (!result.ok) {
      setError(result.errorMessage);
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          disabled={isLoading}
          title="Edit"
          className={`${iconButton} text-sky-400`}
        >
          <Pencil className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={handleDelete}
          disabled={isLoading}
          title="Delete"
          className={`${iconButton} text-rose-400`}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {error && (
        <p className="max-w-56 text-right text-xs text-destructive">{error}</p>
      )}

      {isEditing && (
        <Modal title="Edit Category" onClose={() => setIsEditing(false)}>
          <CategoryForm
            mode="edit"
            category={category}
            onDone={() => setIsEditing(false)}
          />
        </Modal>
      )}
    </div>
  );
}