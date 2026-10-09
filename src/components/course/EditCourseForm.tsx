"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CategorySelect } from "@/components/shared/CategorySelect";
import { callBackend } from "@/lib/api/browser";
import type { Category } from "@/types/category";

type EditableCourse = {
  id: number;
  title: string;
  description: string;
  thumbnail: string | null;
  price: number;
  categoryId: number;
};

export function EditCourseForm({
  course,
  categories,
}: {
  course: EditableCourse;
  categories: Category[];
}) {
  const router = useRouter();
  const [title, setTitle] = useState(course.title);
  const [description, setDescription] = useState(course.description);
  const [thumbnail, setThumbnail] = useState(course.thumbnail ?? "");
  const [price, setPrice] = useState(String(course.price));
  const [categoryId, setCategoryId] = useState(String(course.categoryId));
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    setIsLoading(true);

    const result = await callBackend(`Course/${course.id}`, "PUT", {
      title,
      description,
      thumbnail: thumbnail.trim() || null,
      price: Number(price),
      categoryId: Number(categoryId),
    });

    setIsLoading(false);

    if (!result.ok) {
      setError(result.errorMessage);
      return;
    }

    setSaved(true);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-4">
      {error && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}
      {saved && (
        <p className="rounded-md bg-primary/10 px-3 py-2 text-sm text-highlight">
          تغییرات ذخیره شد.
        </p>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="edit-title">Title</Label>
        <Input
          id="edit-title"
          required
          minLength={3}
          maxLength={150}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="edit-description">Description</Label>
        <textarea
          id="edit-description"
          required
          minLength={10}
          maxLength={2000}
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="edit-thumbnail">Thumbnail URL (optional)</Label>
        <Input
          id="edit-thumbnail"
          type="url"
          value={thumbnail}
          onChange={(e) => setThumbnail(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="edit-price">Price</Label>
          <Input
            id="edit-price"
            type="number"
            min={0}
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="edit-category">Category</Label>
          <CategorySelect
            id="edit-category"
            categories={categories}
            value={categoryId}
            onChange={setCategoryId}
          />
        </div>
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? "در حال ذخیره..." : "Save Changes"}
      </Button>
    </form>
  );
}