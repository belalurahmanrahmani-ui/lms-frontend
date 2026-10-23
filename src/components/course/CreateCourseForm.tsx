"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CategorySelect } from "@/components/shared/CategorySelect";
import { callBackend } from "@/lib/api/browser";
import type { Category } from "@/types/category";
import { CloudinaryUploader } from "@/components/shared/CloudinaryUploader";

export function CreateCourseForm({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [price, setPrice] = useState("0");
  const [categoryId, setCategoryId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const result = await callBackend<{ id: number }>("Course", "POST", {
      title,
      description,
      thumbnail,
      price: Number(price),
      
      categoryId: Number(categoryId),
    });

    setIsLoading(false);

    if (!result.ok || !result.data) {
     setError(result.errorMessage ?? "Failed to create course");
      return;
    }

    router.push(`/teacher/courses/${result.data.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-4">
      {error && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          required
          minLength={3}
          maxLength={150}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">Description</Label>
        <textarea
          id="description"
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
        <Label>Thumbnail (optional)</Label>
        <CloudinaryUploader
          kind="image"
          value={thumbnail}
          onChange={setThumbnail}
          onBusyChange={setIsUploading}
          disabled={isLoading}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="price">Price</Label>
          <Input
            id="price"
            type="number"
            min={0}
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="categoryId">Category</Label>
          <CategorySelect
            id="categoryId"
            categories={categories}
            value={categoryId}
            onChange={setCategoryId}
          />
        </div>
      </div>

      {categories.length === 0 && (
        <p className="text-sm text-muted-foreground">
         No categories exist yet. An admin must create a category first.
        </p>
      )}

            <Button
        type="submit"
        disabled={isLoading || isUploading || categories.length === 0}
      >
        {isLoading ? " creating ..." : "Create Course"}
      </Button>
    </form>
  );
}