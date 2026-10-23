"use client";

import { useMemo, useState } from "react";
import { CourseCard } from "@/components/course/CourseCard";
import type { Course } from "@/types/course";

type PopularCoursesProps = {
  courses: Course[];
  errorMessage: string | null;
};

export function PopularCourses({ courses, errorMessage }: PopularCoursesProps) {
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = useMemo(() => {
    const uniqueNames = Array.from(
      new Set(courses.map((course) => course.categoryName))
    );
    return ["All", ...uniqueNames];
  }, [courses]);

  const filteredCourses =
    activeCategory === "All"
      ? courses
      : courses.filter((course) => course.categoryName === activeCategory);

  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="font-heading text-3xl">
          Popular <span className="text-highlight">Courses</span>
        </h2>

        {categories.length > 1 && (
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
                  activeCategory === category
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-muted-foreground hover:bg-accent"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        )}
      </div>

      {errorMessage ? (
        <p className="text-destructive">{errorMessage}</p>
      ) : filteredCourses.length === 0 ? (
        <p className="text-muted-foreground">No courses have been added yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </section>
  );
}