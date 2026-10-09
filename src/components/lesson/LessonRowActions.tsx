"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Paperclip, Pencil, Trash2 } from "lucide-react";
import { Modal } from "@/components/shared/Modal";
import { LessonForm } from "@/components/lesson/LessonForm";
import { MaterialsModal } from "@/components/lesson/MaterialsModal";
import { callBackend } from "@/lib/api/browser";
import type { Lesson } from "@/types/lesson";

const iconButton =
  "rounded-md p-1.5 transition-colors hover:bg-accent disabled:opacity-50";

export function LessonRowActions({ lesson }: { lesson: Lesson }) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isMaterialsOpen, setIsMaterialsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function togglePublish() {
    setError(null);
    setIsLoading(true);

    const action = lesson.isPublished ? "unpublish" : "publish";
    const result = await callBackend(`lessons/${lesson.id}/${action}`, "PATCH");

    setIsLoading(false);
    if (!result.ok) {
      setError(result.errorMessage);
      return;
    }
    router.refresh();
  }

  async function handleDelete() {
    if (!window.confirm(`درس «${lesson.title.trim()}» حذف شود؟`)) return;

    setError(null);
    setIsLoading(true);

    const result = await callBackend(`lessons/${lesson.id}`, "DELETE");

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
          onClick={() => setIsMaterialsOpen(true)}
          title="Materials"
          className={`${iconButton} text-highlight`}
        >
          <Paperclip className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={togglePublish}
          disabled={isLoading}
          title={lesson.isPublished ? "Unpublish" : "Publish"}
          className={`${iconButton} text-muted-foreground`}
        >
          {lesson.isPublished ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>

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

      {error && <p className="max-w-48 text-right text-xs text-destructive">{error}</p>}

      {isEditing && (
        <Modal title="Edit Lesson" onClose={() => setIsEditing(false)}>
          <LessonForm
            mode="edit"
            lesson={lesson}
            onDone={() => setIsEditing(false)}
          />
        </Modal>
      )}

      {isMaterialsOpen && (
        <MaterialsModal lesson={lesson} onClose={() => setIsMaterialsOpen(false)} />
      )}
    </div>
  );
}