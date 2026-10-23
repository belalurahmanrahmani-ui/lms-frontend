import { BookOpen, CheckCircle, FileEdit, Users } from "lucide-react";
import { StatCard } from "@/components/shared/StatCard";
import { apiFetchServer, ApiError } from "@/lib/api/server";
import type { TeacherDashboard } from "@/types/dashboard";

export default async function TeacherDashboardPage() {
  let data: TeacherDashboard | null = null;
  let errorMessage: string | null = null;

  try {
    data = await apiFetchServer<TeacherDashboard>("/Teacher/dashboard");
  } catch (error) {
    errorMessage =
      error instanceof ApiError ? error.message : "Error fetching dashboard data.";
  }

  if (errorMessage || !data) {
    return <p className="text-destructive">{errorMessage}</p>;
  }

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl">Dashboard</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="My Courses" value={data.totalCourses} icon={BookOpen} />
        <StatCard
          label="Published Courses"
          value={data.publishedCourses}
          icon={CheckCircle}
        />
        <StatCard label="Draft Courses" value={data.draftCourses} icon={FileEdit} />
        <StatCard label="Total Students" value={data.totalStudents} icon={Users} />
      </div>
    </div>
  );
}