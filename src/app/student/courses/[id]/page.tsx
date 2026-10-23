import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Lock } from "lucide-react";
import { CoursePlayer } from "@/components/course/CoursePlayer";
import { apiFetchServer, ApiError } from "@/lib/api/server";
import type { CourseDetail } from "@/types/course";
import type { Lesson } from "@/types/lesson";

export default async function StudentCoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let course: CourseDetail | null = null;
  let lessons: Lesson[] = [];
  let notEnrolled = false;
  let errorMessage: string | null = null;

  try {
    const [courseData, lessonsData] = await Promise.all([
      apiFetchServer<CourseDetail>(`/Course/${id}`),
      apiFetchServer<Lesson[]>(`/courses/${id}/lessons`),
    ]);
    course = courseData;
    lessons = lessonsData;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    if (error instanceof ApiError && error.status === 403) {
      notEnrolled = true;
    } else {
      errorMessage =
        error instanceof ApiError ? error.message : "خطا در دریافت اطلاعات دوره";
    }
  }

  if (notEnrolled) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border p-12 text-center">
        <Lock className="h-8 w-8 text-muted-foreground" />
        <p className="text-muted-foreground">
          برای دیدن درس‌ها باید در این دوره ثبت‌نام کنی.
        </p>
        <Link href="/student/courses" className="text-sm text-primary hover:underline">
          بازگشت به دوره‌های من
        </Link>
      </div>
    );
  }

  if (errorMessage || !course) {
    return <p className="text-destructive">{errorMessage}</p>;
  }

  if (lessons.length === 0) {
    return (
      <div className="space-y-2">
        <h1 className="font-heading text-2xl">{course.title}</h1>
        <p className="text-muted-foreground">
        No lessons have been published in this course yet
        </p>
      </div>
    );
  }

  // شناسه‌ی درس‌های تکمیل‌شده؛ اگر نیامد، همه «تکمیل‌نشده» نمایش داده می‌شوند
  let completedIds: number[] = [];
  try {
    completedIds = await apiFetchServer<number[]>(`/courses/${id}/completed-lessons`);
  } catch {
    // اختیاری
  }

  const sortedLessons = [...lessons].sort(
    (a, b) => a.order - b.order || a.id - b.id
  );

  // شروع از اولین درس تکمیل‌نشده؛ اگر همه تمام شده‌اند، از اولین درس
  const firstUnfinished = sortedLessons.find(
    (lesson) => !completedIds.includes(lesson.id)
  );
  const initialLessonId = (firstUnfinished ?? sortedLessons[0]).id;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <nav className="flex items-center gap-1 text-xs text-muted-foreground">
          <Link href="/student/courses" className="hover:text-foreground">
            My Courses
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="line-clamp-1">{course.title}</span>
        </nav>
        <h1 className="font-heading text-2xl">{course.title}</h1>
        <p className="text-sm text-muted-foreground">
          {course.teacherName} · {course.categoryName}
        </p>
      </div>

      <CoursePlayer
        lessons={sortedLessons}
        initialCompletedIds={completedIds}
        initialLessonId={initialLessonId}
      />
    </div>
  );
}