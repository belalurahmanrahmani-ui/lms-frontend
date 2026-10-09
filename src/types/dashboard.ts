export type StudentDashboard = {
  totalEnrolledCourses: number;
  completedCourses: number;
  recentLessons: unknown[];
};
export type TeacherDashboard = {
  totalCourses: number;
  publishedCourses: number;
  draftCourses: number;
  totalStudents: number;
};