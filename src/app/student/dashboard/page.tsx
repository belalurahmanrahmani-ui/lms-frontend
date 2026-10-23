import { BookOpen, CheckCircle, Clock, TrendingUp } from "lucide-react";
import { StatCard } from "@/components/shared/StatCard";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { apiFetchServer, ApiError } from "@/lib/api/server";
import type { StudentDashboard } from "@/types/dashboard";
import type { CourseProgress } from "@/types/progress";

function formatDate(value: string) {
  // Backend زمان را UTC و بدون Z می‌فرستد؛ Z را اضافه می‌کنیم تا درست خوانده شود
  const iso = value.endsWith("Z") ? value : `${value}Z`;
  return new Date(iso).toLocaleDateString("en-GB");
}
export default async function StudentDashboardPage() {
  let data: StudentDashboard | null = null;
  let progress: CourseProgress[] = [];
  let errorMessage: string | null = null;

  try {
    data = await apiFetchServer<StudentDashboard>("/Student/dashboard");
  } catch (error) {
    errorMessage =
      error instanceof ApiError ? error.message : "خطا در دریافت اطلاعات داشبورد";
  }

  try {
    progress = await apiFetchServer<CourseProgress[]>("/me/progress");
  } catch {
    // پیشرفت اختیاری است؛ اگر نیامد، بخش پیشرفت خالی می‌ماند
  }

  if (errorMessage || !data) {
    return <p className="text-destructive">{errorMessage}</p>;
  }

  const totalLessons = progress.reduce((sum, item) => sum + item.totalLessons, 0);
  const completedLessons = progress.reduce(
    (sum, item) => sum + item.completedLessons,
    0
  );
  const overallProgress =
    totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl">Dashboard</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="My Courses"
          value={data.totalEnrolledCourses}
          icon={BookOpen}
        />
        <StatCard
          label="Completed Courses"
          value={data.completedCourses}
          icon={CheckCircle}
          tone="green"
        />
        <StatCard
          label="Overall Progress"
          value={`${overallProgress}%`}
          icon={TrendingUp}
          tone="orange"
        />
      </div>

      <section className="space-y-4 rounded-2xl border border-border bg-card p-5">
        <h2 className="font-heading text-lg">Course Progress</h2>

        {progress.length === 0 ? (
          <p className="text-sm text-muted-foreground">
              You have not enrolled in any courses yet
          </p>
        ) : (
          <div className="space-y-4">
            {progress.map((item) => (
              <div key={item.courseId} className="space-y-1.5">
                <p className="text-sm">{item.courseTitle.trim()}</p>
                <ProgressBar
                  value={item.progressPercentage}
                  label={`${item.completedLessons}/${item.totalLessons} lessons`}
                />
              </div>
            ))}
          </div>
        )}
      </section>

            <section className="rounded-2xl border border-border bg-card p-5">
        <h2 className="mb-4 flex items-center gap-2 font-heading text-lg">
          <Clock className="h-4 w-4" />
          Recent Lessons
        </h2>

        {data.recentLessons.length === 0 ? (
          <p className="text-sm text-muted-foreground">
        You have not completed any lessons yet         
 </p>
        ) : (
          <ul className="divide-y divide-border">
            {data.recentLessons.map((lesson) => (
              <li
                key={lesson.lessonId}
                className="flex items-center gap-3 py-3"
              >
                <CheckCircle className="h-4 w-4 shrink-0 text-emerald-400" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm">{lesson.lessonTitle.trim()}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {lesson.courseTitle.trim()}
                  </p>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {formatDate(lesson.completedAt)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}