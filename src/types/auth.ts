export type UserRole = "Admin" | "Teacher" | "Student";

export type AuthUser = {
  userId: number;
  fullName: string;
  email: string;
  role: UserRole;
};

export type AuthResponse = AuthUser & {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiration: string;
};