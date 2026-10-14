import {
  BookOpen,
  CheckCircle,
  ClipboardList,
  GraduationCap,
  User,
  Users,
} from "lucide-react";
import { StatCard } from "@/components/shared/StatCard";
import { apiFetchServer, ApiError } from "@/lib/api/server";
import type { AdminDashboard } from "@/types/dashboard";

export default async function AdminDashboardPage() {
  let data: AdminDashboard | null = null;
  let errorMessage: string | null = null;

  try {
    data = await apiFetchServer<AdminDashboard>("/Admin/dashboard");
  } catch (error) {
    errorMessage =
      error instanceof ApiError ? error.message : "خطا در دریافت اطلاعات داشبورد";
  }

  if (errorMessage || !data) {
    return <p className="text-destructive">{errorMessage}</p>;
  }

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl">Dashboard</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Total Users" value={data.totalUsers} icon={Users} />
        <StatCard
          label="Teachers"
          value={data.totalTeachers}
          icon={GraduationCap}
          tone="blue"
        />
        <StatCard
          label="Students"
          value={data.totalStudents}
          icon={User}
          tone="green"
        />
        <StatCard label="Total Courses" value={data.totalCourses} icon={BookOpen} />
        <StatCard
          label="Published Courses"
          value={data.publishedCourses}
          icon={CheckCircle}
          tone="green"
        />
        <StatCard
          label="Total Enrollments"
          value={data.totalEnrollments}
          icon={ClipboardList}
          tone="orange"
        />
      </div>
    </div>
  );
}