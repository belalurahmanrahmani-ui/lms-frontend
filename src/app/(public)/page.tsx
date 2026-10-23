import { Hero } from "@/components/layout/Hero";
import { PopularCourses } from "@/components/course/PopularCourses";
import { apiFetch, ApiError } from "@/lib/api/client";
import type { Course } from "@/types/course";

export default async function HomePage() {
  let courses: Course[] = [];
  let errorMessage: string | null = null;

  try {
    const data = await apiFetch<Course[]>("/Course");
    courses = data.filter((course) => course.isPublished);
  } catch (error) {
    errorMessage =
      error instanceof ApiError ? error.message : "Error Fatching courses ";
  }

  return (
    <main>
      <Hero />
      <PopularCourses courses={courses} errorMessage={errorMessage} />
    </main>
  );
}