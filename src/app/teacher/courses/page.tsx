import Image from "next/image";
import Link from "next/link";
import { BookOpen, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { apiFetchServer, ApiError } from "@/lib/api/server";
import type { Course } from "@/types/course";

export default async function TeacherCoursesPage() {
  let courses: Course[] = [];
  let errorMessage: string | null = null;

  try {
    courses = await apiFetchServer<Course[]>("/Course/my-course");
  } catch (error) {
    errorMessage =
      error instanceof ApiError ? error.message : "rror fetching courses .";
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl">My Courses</h1>
        <Button
          size="sm"
          nativeButton={false}
          render={
            <Link href="/teacher/courses/create" className="flex items-center gap-1.5">
              <Plus className="h-4 w-4" />
              Create Course
            </Link>
          }
        />
      </div>

      {errorMessage ? (
        <p className="text-destructive">{errorMessage}</p>
      ) : courses.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border p-12 text-center">
          <BookOpen className="h-8 w-8 text-muted-foreground" />
          <p className="text-muted-foreground">You have not create  any courses yet..</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => {
            const thumbnailUrl =
              course.thumbnail && course.thumbnail.startsWith("http")
                ? course.thumbnail
                : null;

            return (
              <Link
                key={course.id}
                href={`/teacher/courses/${course.id}`}
                className="overflow-hidden rounded-2xl border border-border bg-card transition-colors hover:border-primary"
              >
                <div className="relative aspect-video w-full bg-muted">
                  {thumbnailUrl ? (
                    <Image
                      src={thumbnailUrl}
                      alt={course.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground">
                      <BookOpen className="h-8 w-8" />
                    </div>
                  )}

                  <Badge
                    className={`absolute right-3 top-3 ${
                      course.isPublished ? "bg-primary" : "bg-muted-foreground"
                    }`}
                  >
                    {course.isPublished ? "Published" : "Draft"}
                  </Badge>
                </div>

                <div className="space-y-1 p-4">
                  <h3 className="line-clamp-1 font-heading text-base">
                    {course.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {course.categoryName} · ${course.price}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}