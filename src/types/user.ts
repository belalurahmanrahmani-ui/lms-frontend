import type { UserRole } from "@/types/auth";

export type AdminUser = {
  id: number;
  fullName: string;
  email: string;
  role: UserRole;
  profileImage: string | null;
  isActive: boolean;
  createdAt: string;
};