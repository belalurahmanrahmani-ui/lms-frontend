import Image from "next/image";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { apiFetchServer, ApiError } from "@/lib/api/server";
import type { EnrolledCourse } from "@/types/enrollment";
import type { CourseProgress } from "@/types/progress";

export default async function StudentCoursesPage() {
  let courses: EnrolledCourse[] = [];
  let progressByCourse = new Map<number, CourseProgress>();
  let errorMessage: string | null = null;

  try {
    courses = await apiFetchServer<EnrolledCourse[]>("/me/courses");
  } catch (error) {
    errorMessage =
      error instanceof ApiError ? error.message : "خطا در دریافت دوره‌ها";
  }

  try {
    const progress = await apiFetchServer<CourseProgress[]>("/me/progress");
    progressByCourse = new Map(progress.map((item) => [item.courseId, item]));
  } catch {
    // پیشرفت اختیاری است؛ اگر نیامد فقط نوار پیشرفت نمایش داده نمی‌شود
  }

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl">My Courses</h1>

      {errorMessage ? (
        <p className="text-destructive">{errorMessage}</p>
      ) : courses.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border p-12 text-center">
          <BookOpen className="h-8 w-8 text-muted-foreground" />
          <p className="text-muted-foreground">
            هنوز در هیچ دوره‌ای ثبت‌نام نکرده‌ای.
          </p>
          <Link href="/courses" className="text-sm text-primary hover:underline">
            مرور دوره‌ها
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((enrollment) => {
            const thumbnailUrl =
              enrollment.thumbnail && enrollment.thumbnail.startsWith("http")
                ? enrollment.thumbnail
                : null;
            const progress = progressByCourse.get(enrollment.courseId);

            return (
              <Link
                key={enrollment.id}
                href={`/student/courses/${enrollment.courseId}`}
                className="overflow-hidden rounded-2xl border border-border bg-card transition-colors hover:border-primary"
              >
                <div className="relative aspect-video w-full bg-muted">
                  {thumbnailUrl ? (
                    <Image
                      src={thumbnailUrl}
                      alt={enrollment.courseTitle}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground">
                      <BookOpen className="h-8 w-8" />
                    </div>
                  )}
                </div>

                <div className="space-y-3 p-4">
                  <div className="space-y-1">
                    <h3 className="line-clamp-1 font-heading text-base">
                      {enrollment.courseTitle}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {enrollment.teacherName}
                    </p>
                  </div>

                  {progress && (
                    <ProgressBar
                      value={progress.progressPercentage}
                      label={`${progress.completedLessons}/${progress.totalLessons} lessons`}
                    />
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}