"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Circle, CheckCircle, ExternalLink, FileText, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { callBackend } from "@/lib/api/browser";
import { cn } from "@/lib/utils";
import type { Lesson } from "@/types/lesson";
import type { Material } from "@/types/material";

const isSafeUrl = (url: string) => /^https?:\/\//i.test(url);

export function CoursePlayer({
  lessons,
  initialCompletedIds,
  initialLessonId,
}: {
  lessons: Lesson[];
  initialCompletedIds: number[];
  initialLessonId: number;
}) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState(initialLessonId);
  const [completedIds, setCompletedIds] = useState(initialCompletedIds);
  const [materialsByLesson, setMaterialsByLesson] = useState<
    Record<number, Material[]>
  >({});
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selected = lessons.find((lesson) => lesson.id === selectedId) ?? lessons[0];
  const isCompleted = completedIds.includes(selected.id);
  const completedCount = lessons.filter((lesson) =>
    completedIds.includes(lesson.id)
  ).length;
  const percent = Math.round((completedCount / lessons.length) * 100);
  const materials = materialsByLesson[selected.id];

  // فایل‌های درس انتخاب‌شده را یک‌بار می‌گیریم و نگه می‌داریم
  useEffect(() => {
    if (materialsByLesson[selected.id] !== undefined) return;

    let ignore = false;

    async function load() {
      const result = await callBackend<Material[]>(
        `lessons/${selected.id}/materials`,
        "GET"
      );
      if (ignore) return;

      setMaterialsByLesson((previous) => ({
        ...previous,
        [selected.id]: result.ok ? (result.data ?? []) : [],
      }));
    }

    load();
    return () => {
      ignore = true;
    };
  }, [selected.id, materialsByLesson]);

  function selectLesson(id: number) {
    setSelectedId(id);
    setError(null);
  }

  async function handleComplete() {
    setError(null);
    setIsSaving(true);

    const result = await callBackend(`lessons/${selected.id}/complete`, "POST");

    setIsSaving(false);

    if (!result.ok) {
      setError(result.errorMessage);
      return;
    }

    setCompletedIds((previous) =>
      previous.includes(selected.id) ? previous : [...previous, selected.id]
    );
    router.refresh();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
      {/* Left: player + details */}
      <div className="min-w-0 space-y-4">
        {selected.videoUrl && isSafeUrl(selected.videoUrl) ? (
          <video
            key={selected.id}
            src={selected.videoUrl}
            controls
            preload="metadata"
            className="aspect-video w-full rounded-2xl bg-black"
          />
        ) : (
          <div className="flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-2xl border border-border bg-card text-muted-foreground">
            <PlayCircle className="h-10 w-10" />
            <span className="text-sm">This course has not a lesson </span>
          </div>
        )}

        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <h2 className="font-heading text-xl">{selected.title.trim()}</h2>
            <p className="text-xs text-muted-foreground">{selected.duration} min</p>
          </div>

          {isCompleted ? (
            <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1.5 text-sm text-emerald-400">
              <CheckCircle className="h-4 w-4" />
              Completed
            </span>
          ) : (
            <Button onClick={handleComplete} disabled={isSaving}>
              {isSaving ? "Ragiteing ..." : "Mark as completed"}
            </Button>
          )}
        </div>

        {error && (
          <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        {selected.description && (
          <p className="text-sm text-muted-foreground">{selected.description}</p>
        )}

        <section className="space-y-3 rounded-2xl border border-border bg-card p-4">
          <h3 className="font-heading text-base">Materials</h3>

          {materials === undefined ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : materials.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              این درس فایلی ندارد.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {materials.map((material) => (
                <li key={material.id} className="flex items-center gap-3 py-2">
                  <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm">{material.fileName}</p>
                    <p className="text-xs uppercase text-muted-foreground">
                      {material.fileType}
                    </p>
                  </div>
                  {isSafeUrl(material.fileUrl) && (
                    <a
                      href={material.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sm text-primary hover:underline"
                    >
                      Open
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* Right: progress + lesson list */}
      <aside className="space-y-4 rounded-2xl border border-border bg-card p-4 lg:sticky lg:top-6 lg:self-start">
        <ProgressBar
          value={percent}
          label={`${completedCount}/${lessons.length} lessons`}
        />

        <ul className="space-y-1">
          {lessons.map((lesson, index) => {
            const done = completedIds.includes(lesson.id);
            const active = lesson.id === selected.id;

            return (
              <li key={lesson.id}>
                <button
                  type="button"
                  onClick={() => selectLesson(lesson.id)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors",
                    active
                      ? "bg-primary/20 text-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  {done ? (
                    <CheckCircle className="h-4 w-4 shrink-0 text-emerald-400" />
                  ) : (
                    <Circle className="h-4 w-4 shrink-0" />
                  )}
                  <span className="min-w-0 flex-1 truncate">
                    {index + 1}. {lesson.title.trim()}
                  </span>
                  <span className="text-xs">{lesson.duration}m</span>
                </button>
              </li>
            );
          })}
        </ul>
      </aside>
    </div>
  );
}