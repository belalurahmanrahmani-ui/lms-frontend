"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Trash2 } from "lucide-react";
import { callBackend } from "@/lib/api/browser";

const iconButton =
  "rounded-md p-1.5 transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40";

export function AdminCourseActions({
  courseId,
  title,
  isPublished,
}: {
  courseId: number;
  title: string;
  isPublished: boolean;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function togglePublish() {
    setError(null);
    setIsLoading(true);

    const action = isPublished ? "unpublish" : "publish";
    const result = await callBackend(`Course/${courseId}/${action}`, "PATCH");

    setIsLoading(false);

    if (!result.ok) {
      setError(result.errorMessage);
      return;
    }
    router.refresh();
  }

  async function handleDelete() {
    if (
      !window.confirm(
        `دوره «${title.trim()}» do you want to delete it `
      )
    ) {
      return;
    }

    setError(null);
    setIsLoading(true);

    const result = await callBackend(`Course/${courseId}`, "DELETE");

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
          onClick={togglePublish}
          disabled={isLoading}
          title={isPublished ? "Unpublish" : "Publish"}
          className={`${iconButton} ${
            isPublished ? "text-amber-400" : "text-emerald-400"
          }`}
        >
          {isPublished ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
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
    </div>
  );
}