import { BookOpen, CheckCircle, Clock, TrendingUp } from "lucide-react";
import { StatCard } from "@/components/shared/StatCard";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { apiFetchServer, ApiError } from "@/lib/api/server";
import type { StudentDashboard } from "@/types/dashboard";
import type { CourseProgress } from "@/types/progress";

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

  // پیشرفت کلی = درس‌های تکمیل‌شده ÷ کل درس‌ها (طبق قانون پروژه)
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
            هنوز در دوره‌ای ثبت‌نام نکرده‌ای.
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
            هنوز هیچ درسی شروع نشده است.
          </p>
        ) : (
          <pre className="text-xs text-muted-foreground">
            {JSON.stringify(data.recentLessons, null, 2)}
          </pre>
        )}
      </section>
    </div>
  );
}