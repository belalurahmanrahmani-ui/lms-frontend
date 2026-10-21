import Link from "next/link";
import { SearchX } from "lucide-react";
import { CourseCard } from "@/components/course/CourseCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiFetch, ApiError } from "@/lib/api/client";
import { cn } from "@/lib/utils";
import type { Course } from "@/types/course";

const priceTabs = [
  { label: "All", value: "all" },
  { label: "Free", value: "free" },
  { label: "Paid", value: "paid" },
];

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; price?: string }>;
}) {
  const { q, category, price } = await searchParams;

  let courses: Course[] = [];
  let errorMessage: string | null = null;

  try {
    courses = await apiFetch<Course[]>("/Course");
  } catch (error) {
    errorMessage =
      error instanceof ApiError ? error.message : "خطا در دریافت کورس‌ها";
  }

  if (errorMessage) {
    return <p className="p-6 text-destructive">{errorMessage}</p>;
  }

  const categories = [
    "All",
    ...Array.from(
      new Set(courses.map((c) => c.categoryName).filter(Boolean))
    ),
  ];

  const activeCategory =
    category && categories.includes(category) ? category : "All";
  const activePrice = priceTabs.some((t) => t.value === price)
    ? (price as string)
    : "all";
  const query = q?.trim().toLowerCase() ?? "";

  const filteredCourses = courses.filter((c) => {
    const matchesQuery =
      !query ||
      c.title.toLowerCase().includes(query) ||
      (c.description ?? "").toLowerCase().includes(query);
    const matchesCategory =
      activeCategory === "All" || c.categoryName === activeCategory;
    const matchesPrice =
      activePrice === "all" ||
      (activePrice === "free" ? c.price <= 0 : c.price > 0);
    return matchesQuery && matchesCategory && matchesPrice;
  });

  function buildHref(next: { category?: string; price?: string }) {
    const params = new URLSearchParams();
    const nextCategory = next.category ?? activeCategory;
    const nextPrice = next.price ?? activePrice;
    if (nextCategory !== "All") params.set("category", nextCategory);
    if (nextPrice !== "all") params.set("price", nextPrice);
    if (q) params.set("q", q);
    const queryString = params.toString();
    return queryString ? `/courses?${queryString}` : "/courses";
  }

  const pill = (active: boolean) =>
    cn(
      "rounded-full px-4 py-1.5 text-sm transition-colors",
      active
        ? "bg-primary text-primary-foreground"
        : "bg-card text-muted-foreground hover:bg-accent"
    );

  return (
    <main className="mx-auto max-w-7xl space-y-8 px-6 py-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-heading text-3xl">
          All <span className="text-highlight">Courses</span>
        </h1>

        <form action="/courses" className="flex gap-2">
          {activeCategory !== "All" && (
            <input type="hidden" name="category" value={activeCategory} />
          )}
          {activePrice !== "all" && (
            <input type="hidden" name="price" value={activePrice} />
          )}
          <Input
            name="q"
            defaultValue={q ?? ""}
            placeholder="Search courses"
            className="w-64"
          />
          <Button type="submit" size="sm" variant="outline">
            Search
          </Button>
        </form>
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {categories.map((name) => (
            <Link
              key={name}
              href={buildHref({ category: name })}
              className={pill(activeCategory === name)}
            >
              {name}
            </Link>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {priceTabs.map((tab) => (
            <Link
              key={tab.value}
              href={buildHref({ price: tab.value })}
              className={pill(activePrice === tab.value)}
            >
              {tab.label}
            </Link>
          ))}
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        {filteredCourses.length} courses
      </p>

      {filteredCourses.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-12 text-center">
          <SearchX className="h-8 w-8 text-muted-foreground" />
          <p className="text-muted-foreground">کورسی پیدا نشد.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </main>
  );
}