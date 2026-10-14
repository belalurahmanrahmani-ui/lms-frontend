"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { callBackend } from "@/lib/api/browser";
import type { Category } from "@/types/category";

type CategoryFormProps =
  | { mode: "create"; onDone: () => void }
  | { mode: "edit"; category: Category; onDone: () => void };

export function CategoryForm(props: CategoryFormProps) {
  const router = useRouter();
  const category = props.mode === "edit" ? props.category : null;

  const [name, setName] = useState(category?.name ?? "");
  const [description, setDescription] = useState(category?.description ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const body = { name: name.trim(), description: description.trim() };

    const result =
      props.mode === "create"
        ? await callBackend("Category", "POST", body)
        : await callBackend(`Category/${props.category.id}`, "PUT", body);

    setIsLoading(false);

    if (!result.ok) {
      setError(result.errorMessage);
      return;
    }

    props.onDone();
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="category-name">Name</Label>
        <Input
          id="category-name"
          required
          minLength={2}
          maxLength={50}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="category-description">Description (optional)</Label>
        <textarea
          id="category-description"
          rows={3}
          maxLength={300}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading
          ? "در حال ذخیره..."
          : props.mode === "create"
            ? "Add Category"
            : "Save Changes"}
      </Button>
    </form>
  );
}