import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookOpen, Clock, PlayCircle, Users } from "lucide-react";
import { EnrollButton } from "@/components/course/EnrollButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { apiFetch, ApiError } from "@/lib/api/client";
import { apiFetchServer } from "@/lib/api/server";
import { getCurrentUser } from "@/lib/auth/session";

type CourseDetails = {
  id: number;
  title: string;
  description: string;
  thumbnail: string | null;
  price: number;
  teacherName: string;
  categoryName: string;
  lessonCount: number;
  totalDuration: number;
  enrollmentCount: number;
  lessons: { id: number; title: string; duration: number; order: number }[];
};

function formatMinutes(total: number) {
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  if (hours === 0) return `${minutes}m`;
  return minutes === 0 ? `${hours}h` : `${hours}h ${minutes}m`;
}

export default async function CourseDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const courseId = Number(id);
  if (!Number.isInteger(courseId) || courseId <= 0) notFound();

  let course: CourseDetails;
  try {
    course = await apiFetch<CourseDetails>(`/Course/${courseId}`);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    return (
      <p className="p-6 text-destructive">
        {error instanceof ApiError ? error.message : "خطا در دریافت کورس"}
      </p>
    );
  }

  const currentUser = await getCurrentUser();
  const isStudent = currentUser?.role === "Student";

  let isEnrolled = false;
  if (isStudent) {
    try {
      const myCourses = await apiFetchServer<{ courseId: number }[]>("/me/courses");
      isEnrolled = myCourses.some((c) => c.courseId === courseId);
    } catch {
      isEnrolled = false;
    }
  }

  const thumbnailUrl =
    course.thumbnail && course.thumbnail.startsWith("http")
      ? course.thumbnail
      : null;
  const isFree = course.price === 0;
  const lessons = [...course.lessons].sort((a, b) => a.order - b.order);

  return (
    <main className="mx-auto grid max-w-7xl gap-8 px-6 py-12 lg:grid-cols-3">
      <div className="space-y-8 lg:col-span-2">
        <div className="space-y-4">
          <Badge className="bg-primary">{course.categoryName}</Badge>
          <h1 className="font-heading text-3xl leading-tight">{course.title}</h1>
          <p className="text-muted-foreground">by {course.teacherName}</p>
        </div>

        <section className="space-y-3">
          <h2 className="font-heading text-xl">About this course</h2>
          <p className="whitespace-pre-line text-muted-foreground">
            {course.description}
          </p>
        </section>

        <section className="rounded-2xl border border-border bg-card">
          <div className="px-5 py-4">
            <h2 className="font-heading text-xl">
              Lessons ({course.lessonCount})
            </h2>
          </div>
          {lessons.length === 0 ? (
            <p className="border-t border-border px-5 py-6 text-sm text-muted-foreground">
            
              There is no lesson exist in this course  for now 
            </p>
          ) : (
            <ul className="divide-y divide-border border-t border-border">
              {lessons.map((lesson, index) => (
                <li
                  key={lesson.id}
                  className="flex items-center justify-between gap-4 px-5 py-3 text-sm"
                >
                  <span className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/20 text-xs text-highlight">
                      {index + 1}
                    </span>
                    {lesson.title}
                  </span>
                  <span className="text-muted-foreground">
                    {formatMinutes(lesson.duration)}
                  </span>

                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <aside className="h-fit space-y-5 rounded-2xl border border-border bg-card p-5">
        <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-muted">
          {thumbnailUrl ? (
            <Image
              src={thumbnailUrl}
              alt={course.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <PlayCircle className="h-10 w-10" />
            </div>
          )}
        </div>

        <p className="font-heading text-3xl text-highlight">
          {isFree ? "Free" : `$${course.price}`}
        </p>
           {!isFree && (
          <p className="rounded-lg bg-primary/10 px-3 py-2 text-xs text-muted-foreground">
           In this version, enrollment in all courses is currently free, and online payment is not active.
          </p>
        )}
        {!currentUser ? (
          <Button
            className="w-full"
            nativeButton={false}
            render={<Link href="/login">Login to enroll</Link>}
          />
        ) : isStudent ? (
          isEnrolled ? (
            <Button
              className="w-full"
              nativeButton={false}
              render={
                <Link href={`/student/courses/${course.id}`}>
                  Continue Learning
                </Link>
              }
            />
          ) : (
            <EnrollButton courseId={course.id} />
          )
        ) : (
          <p className="text-sm text-muted-foreground">
           
            Just students can enroll in the course .
          </p>
        )}

        <ul className="space-y-3 border-t border-border pt-4 text-sm text-muted-foreground">
          <li className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" /> {course.lessonCount} lessons
          </li>
          <li className="flex items-center gap-2">
            <Clock className="h-4 w-4" /> {formatMinutes(course.totalDuration)}
          </li>
          <li className="flex items-center gap-2">
            <Users className="h-4 w-4" /> {course.enrollmentCount} enrolled
          </li>
        </ul>
      </aside>
    </main>
  );
}