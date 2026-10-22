import Link from "next/link";
import { notFound } from "next/navigation";
import { BookOpen, ChevronRight, Clock, PlayCircle, Tag, Users } from "lucide-react";
import { StatCard } from "@/components/shared/StatCard";
import { CourseActions } from "@/components/course/CourseActions";
import { EditCourseForm } from "@/components/course/EditCourseForm";
import { AddLessonButton } from "@/components/lesson/AddLessonButton";
import { LessonRowActions } from "@/components/lesson/LessonRowActions";
import { apiFetchServer, ApiError } from "@/lib/api/server";
import { cn } from "@/lib/utils";
import type { Course, CourseDetail } from "@/types/course";
import type { Lesson } from "@/types/lesson";
import type { Category } from "@/types/category";
import { ProgressBar } from "@/components/shared/ProgressBar";
import type { CourseStudent } from "@/types/student";
import Image from "next/image";

const UNSET_ORDER = 2147483647;
function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-GB");
}

function StatusPill({ isPublished }: { isPublished: boolean }) {
  return (
    <span
      className={cn(
        "rounded-full px-3 py-1 text-xs font-medium",
        isPublished
          ? "bg-emerald-500/15 text-emerald-400"
          : "bg-rose-500/15 text-rose-400"
      )}
    >
      {isPublished ? "Published" : "Draft"}
    </span>
  );
}

export default async function ManageCoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let detail: CourseDetail | null = null;
  let myCourse: Course | null = null;
  let lessons: Lesson[] = [];
  let categories: Category[] = [];
  let errorMessage: string | null = null;

  try {
    const [detailData, myCourses, lessonsData, categoriesData] = await Promise.all([
  apiFetchServer<CourseDetail>(`/Course/${id}`),
  apiFetchServer<Course[]>("/Course/my-course"),
  apiFetchServer<Lesson[]>(`/courses/${id}/lessons`),
  apiFetchServer<Category[]>("/Category"),
]);
    detail = detailData;
    myCourse = myCourses.find((course) => course.id === Number(id)) ?? null;
    lessons = lessonsData;
    categories = categoriesData;

  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    errorMessage =
      error instanceof ApiError ? error.message : "خطا در دریافت اطلاعات دوره";
  }

  if (errorMessage) {
    return <p className="text-destructive">{errorMessage}</p>;
  }

  if (!detail || !myCourse) {
    notFound();
  }
    let students: CourseStudent[] = [];
  let studentsError: string | null = null;

  try {
    students = await apiFetchServer<CourseStudent[]>(`/courses/${id}/students`);
  } catch (error) {
    studentsError =
      error instanceof ApiError ? error.message : "خطا در دریافت دانشجوها";
  }

  const sortedLessons = [...lessons].sort((a, b) => a.order - b.order);

  // ترتیب پیشنهادی برای درس جدید: بزرگ‌ترین ترتیب واقعی + ۱
  const usedOrders = lessons
    .filter((lesson) => lesson.order < UNSET_ORDER)
    .map((lesson) => lesson.order);
  const nextOrder = usedOrders.length > 0 ? Math.max(...usedOrders) + 1 : 1;
  const thumbnailUrl =
    detail.thumbnail && detail.thumbnail.startsWith("http")
      ? detail.thumbnail
      : null;
  return (
    <div className="space-y-6">
      {/* Hero panel */}
      <section className="overflow-hidden rounded-3xl border border-border bg-linear-to-br from-card via-card to-primary/25 p-6 sm:p-8">
        <div className="grid items-center gap-6 md:grid-cols-[1fr_auto]">
          <div className="space-y-4">
            <nav className="flex items-center gap-1 text-xs text-muted-foreground">
              <Link href="/teacher/courses" className="hover:text-foreground">
                My Courses
              </Link>
              <ChevronRight className="h-3 w-3" />
              <span className="line-clamp-1">{detail.title}</span>
            </nav>

            <div className="space-y-1">
              <h1 className="font-heading text-3xl sm:text-4xl">Manage Course</h1>
              <p className="font-heading text-2xl text-highlight">{detail.title}</p>
            </div>

            <p className="line-clamp-2 max-w-xl text-sm text-muted-foreground">
              {detail.description}
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <StatusPill isPublished={myCourse.isPublished} />
              <span className="text-sm text-muted-foreground">
                {detail.categoryName}
              </span>
            </div>

            <CourseActions courseId={detail.id} isPublished={myCourse.isPublished} />
          </div>
          <div className="relative hidden h-60 w-96 items-center justify-center overflow-hidden rounded-3xl bg-primary/20 md:flex">
            {thumbnailUrl ? (
              <Image
                src={thumbnailUrl}
                alt={detail.title}
                fill
                sizes="224px"
                className="object-cover"
              />
            ) : (
              <span className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
                <PlayCircle className="h-10 w-10" />
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Lessons" value={detail.lessonCount} icon={BookOpen} />
        <StatCard
          label="Total Duration"
          value={`${detail.totalDuration} min`}
          icon={Clock}
          tone="orange"
        />
        <StatCard
          label="Enrolled Students"
          value={detail.enrollmentCount}
          icon={Users}
          tone="blue"
        />
        <StatCard
          label="Price"
          value={detail.price === 0 ? "Free" : `$${detail.price}`}
          icon={Tag}
          tone="green"
        />
      </div>

      {/* Lessons table */}
      <section className="rounded-2xl border border-border bg-card">
        <div className="flex items-center justify-between px-5 py-4">
          <h2 className="font-heading text-lg">Lessons</h2>
          <AddLessonButton courseId={detail.id} defaultOrder={nextOrder} />
        </div>

        {sortedLessons.length === 0 ? (
          <p className="px-5 pb-5 text-sm text-muted-foreground">
            هنوز درسی اضافه نشده است.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-y border-border text-xs uppercase text-muted-foreground">
                  <th className="px-5 py-3 font-medium">#</th>
                  <th className="px-5 py-3 font-medium">Title</th>
                  <th className="px-5 py-3 font-medium">Duration</th>
                  <th className="px-5 py-3 font-medium">Order</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {sortedLessons.map((lesson, index) => (
                  <tr key={lesson.id} className="hover:bg-accent/40">
                    <td className="px-5 py-3 text-muted-foreground">{index + 1}</td>
                    <td className="px-5 py-3">{lesson.title.trim()}</td>
                    <td className="px-5 py-3 text-muted-foreground">
                      {lesson.duration} min
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">
                      {lesson.order === UNSET_ORDER ? "—" : lesson.order}
                    </td>
                    <td className="px-5 py-3">
                      <StatusPill isPublished={lesson.isPublished} />
                    </td>
                    <td className="px-5 py-3">
                      <LessonRowActions lesson={lesson} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
            {/* Enrolled students */}
      <section className="rounded-2xl border border-border bg-card">
        <div className="flex items-center justify-between px-5 py-4">
          <h2 className="font-heading text-lg">Enrolled Students</h2>
          <span className="text-sm text-muted-foreground">{students.length}</span>
        </div>

        {studentsError ? (
          <p className="px-5 pb-5 text-sm text-destructive">{studentsError}</p>
        ) : students.length === 0 ? (
          <p className="px-5 pb-5 text-sm text-muted-foreground">
            هنوز هیچ دانشجویی در این دوره ثبت‌نام نکرده است.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-y border-border text-xs uppercase text-muted-foreground">
                  <th className="px-5 py-3 font-medium">#</th>
                  <th className="px-5 py-3 font-medium">Student</th>
                  <th className="px-5 py-3 font-medium">Enrolled</th>
                  <th className="px-5 py-3 font-medium">Progress</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {students.map((student, index) => (
                  <tr key={student.studentId} className="hover:bg-accent/40">
                    <td className="px-5 py-3 text-muted-foreground">{index + 1}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-medium text-highlight">
                          {student.fullName.charAt(0).toUpperCase()}
                        </span>
                        <div className="leading-tight">
                          <p>{student.fullName}</p>
                          <p className="text-xs text-muted-foreground">
                            {student.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">
                      {formatDate(student.enrolledAt)}
                    </td>
                    <td className="min-w-48 px-5 py-3">
                      <ProgressBar
                        value={student.progressPercentage}
                        label={`${student.completedLessons}/${student.totalLessons} lessons`}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Edit form */}
      <section className="space-y-4 rounded-2xl border border-border bg-card p-5 sm:p-6">
        <h2 className="font-heading text-lg">Edit Course</h2>
        <EditCourseForm
        categories={categories}
          course={{
            id: detail.id,
            title: detail.title,
            description: detail.description,
            thumbnail: detail.thumbnail,
            price: detail.price,
            categoryId: myCourse.categoryId,
          }}
        />
      </section>
    </div>
  );
}