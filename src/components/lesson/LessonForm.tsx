"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { callBackend } from "@/lib/api/browser";
import type { Lesson } from "@/types/lesson";
import { CloudinaryUploader } from "@/components/shared/CloudinaryUploader";

type LessonFormProps =
  | { mode: "create"; courseId: number; defaultOrder: number; onDone: () => void }
  | { mode: "edit"; lesson: Lesson; onDone: () => void };

export function LessonForm(props: LessonFormProps) {
  const router = useRouter();
  const lesson = props.mode === "edit" ? props.lesson : null;

  const [title, setTitle] = useState(lesson?.title.trim() ?? "");
  const [description, setDescription] = useState(lesson?.description ?? "");
  const [videoUrl, setVideoUrl] = useState<string | null>(lesson?.videoUrl || null);
  const [isUploading, setIsUploading] = useState(false);
  const [duration, setDuration] = useState(String(lesson?.duration ?? 10));
  const [order, setOrder] = useState(
    props.mode === "edit" ? String(props.lesson.order) : String(props.defaultOrder)
  );
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    setIsLoading(true);

    const body = {
      title,
      description: description.trim() || null,
      videoUrl,
      duration: Number(duration),
      order: Number(order),
    };

    const result =
      props.mode === "create"
        ? await callBackend(`courses/${props.courseId}/lessons`, "POST", body)
        : await callBackend(`lessons/${props.lesson.id}`, "PUT", body);

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
        <Label htmlFor="lesson-title">Title</Label>
        <Input
          id="lesson-title"
          required
          minLength={3}
          maxLength={150}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="lesson-description">Description (optional)</Label>
        <textarea
          id="lesson-description"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      </div>

      <div className="space-y-1.5">
        <Label>Video (optional)</Label>
        <CloudinaryUploader
          kind="video"
          value={videoUrl}
          onChange={setVideoUrl}
          onBusyChange={setIsUploading}
          disabled={isLoading}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="lesson-duration">Duration (minutes)</Label>
          <Input
            id="lesson-duration"
            type="number"
            required
            min={1}
            max={600}
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="lesson-order">Order</Label>
          <Input
            id="lesson-order"
            type="number"
            required
            min={0}
            value={order}
            onChange={(e) => setOrder(e.target.value)}
          />
        </div>
      </div>

        <Button type="submit" className="w-full" disabled={isLoading || isUploading}>
        {isLoading
          ? "در حال ذخیره..."
          : props.mode === "create"
            ? "Add Lesson"
            : "Save Changes"}
      </Button>
    </form>
  );
}