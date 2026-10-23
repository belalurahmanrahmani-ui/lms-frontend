import Link from "next/link";
import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AdminCourseActions } from "@/components/course/AdminCourseActions";
import { apiFetchServer, ApiError } from "@/lib/api/server";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Course } from "@/types/course";

const statusTabs = ["All", "Published", "Draft"];

export default async function AdminCoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const { status, q } = await searchParams;

  let courses: Course[] = [];
  let errorMessage: string | null = null;

  try {
    courses = await apiFetchServer<Course[]>("/Admin/courses");
  } catch (error) {
    errorMessage =
      error instanceof ApiError ? error.message : "Error fetching course .";
  }

  if (errorMessage) {
    return <p className="text-destructive">{errorMessage}</p>;
  }

  const activeStatus = status && statusTabs.includes(status) ? status : "All";
  const query = q?.trim().toLowerCase() ?? "";

  const filteredCourses = courses.filter((course) => {
    const matchesStatus =
      activeStatus === "All" ||
      (activeStatus === "Published" ? course.isPublished : !course.isPublished);

    const matchesQuery =
      !query ||
      [course.title, course.teacherName, course.categoryName].some((value) =>
        value.toLowerCase().includes(query)
      );

    return matchesStatus && matchesQuery;
  });

  function tabHref(tab: string) {
    const params = new URLSearchParams();
    if (tab !== "All") params.set("status", tab);
    if (q) params.set("q", q);
    const queryString = params.toString();
    return queryString ? `/admin/courses?${queryString}` : "/admin/courses";
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-heading text-2xl">Courses</h1>

        <form action="/admin/courses" className="flex gap-2">
          {activeStatus !== "All" && (
            <input type="hidden" name="status" value={activeStatus} />
          )}
          <Input
            name="q"
            defaultValue={q ?? ""}
            placeholder="Search title, teacher or category"
            className="w-72"
          />
          <Button type="submit" size="sm" variant="outline">
            Search
          </Button>
        </form>
      </div>

      <div className="flex flex-wrap gap-2">
        {statusTabs.map((tab) => (
          <Link
            key={tab}
            href={tabHref(tab)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm transition-colors",
              activeStatus === tab
                ? "bg-primary text-primary-foreground"
                : "bg-card text-muted-foreground hover:bg-accent"
            )}
          >
            {tab}
          </Link>
        ))}
      </div>

      <section className="rounded-2xl border border-border bg-card">
        <div className="px-5 py-4 text-sm text-muted-foreground">
          {filteredCourses.length} courses
        </div>

        {filteredCourses.length === 0 ? (
          <div className="flex flex-col items-center gap-3 p-12 text-center">
            <BookOpen className="h-8 w-8 text-muted-foreground" />
            <p className="text-muted-foreground">Can not find a course</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-y border-border text-xs uppercase text-muted-foreground">
                  <th className="px-5 py-3 font-medium">Course</th>
                  <th className="px-5 py-3 font-medium">Teacher</th>
                  <th className="px-5 py-3 font-medium">Price</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Created</th>
                  <th className="px-5 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredCourses.map((course) => (
                  <tr key={course.id} className="hover:bg-accent/40">
                    <td className="max-w-xs px-5 py-3">
                      <p className="truncate">{course.title.trim()}</p>
                      <p className="text-xs text-muted-foreground">
                        {course.categoryName}
                      </p>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">
                      {course.teacherName}
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">
                      {course.price === 0 ? "Free" : `$${course.price}`}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={cn(
                          "rounded-full px-3 py-1 text-xs font-medium",
                          course.isPublished
                            ? "bg-emerald-500/15 text-emerald-400"
                            : "bg-rose-500/15 text-rose-400"
                        )}
                      >
                        {course.isPublished ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">
                      {formatDate(course.createdAt)}
                    </td>
                    <td className="px-5 py-3">
                      <AdminCourseActions
                        courseId={course.id}
                        title={course.title}
                        isPublished={course.isPublished}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}