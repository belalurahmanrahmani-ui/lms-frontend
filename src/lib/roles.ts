import type { UserRole } from "@/types/auth";

// باید دقیقاً با enum UserRole در Backend یکی باشد: Admin = 0, Teacher = 1, Student = 2
export const ROLE_VALUES: Record<UserRole, number> = {
  Admin: 0,
  Teacher: 1,
  Student: 2,
};

export const ROLES: UserRole[] = ["Admin", "Teacher", "Student"];