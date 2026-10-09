"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { callBackend } from "@/lib/api/browser";

export function CourseActions({
  courseId,
  isPublished,
}: {
  courseId: number;
  isPublished: boolean;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function togglePublish() {
    setError(null);
    setIsLoading(true);

    const action = isPublished ? "unpublish" : "publish";
    const result = await callBackend(`Course/${courseId}/${action}`, "PATCH");

    if (!result.ok) {
      setError(result.errorMessage);
    } else {
      router.refresh();
    }
    setIsLoading(false);
  }

  async function handleDelete() {
    if (!window.confirm("آیا از حذف این دوره مطمئن هستی؟ این کار قابل بازگشت نیست.")) {
      return;
    }

    setError(null);
    setIsLoading(true);

    const result = await callBackend(`Course/${courseId}`, "DELETE");

    if (!result.ok) {
      setError(result.errorMessage);
      setIsLoading(false);
      return;
    }

    router.push("/teacher/courses");
    router.refresh();
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={togglePublish} disabled={isLoading}>
          {isPublished ? "Unpublish" : "Publish"}
        </Button>
        <Button variant="destructive" size="sm" onClick={handleDelete} disabled={isLoading}>
          Delete
        </Button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}