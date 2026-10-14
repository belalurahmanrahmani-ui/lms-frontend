export type StudentDashboard = {
  totalEnrolledCourses: number;
  completedCourses: number;
    recentLessons: RecentLesson[];
};
export type TeacherDashboard = {
  totalCourses: number;
  publishedCourses: number;
  draftCourses: number;
  totalStudents: number;
};
export type RecentLesson = {
  lessonId: number;
  lessonTitle: string;
  courseTitle: string;
  completedAt: string;
};
export type AdminDashboard = {
  totalUsers: number;
  totalTeachers: number;
  totalStudents: number;
  totalCourses: number;
  publishedCourses: number;
  totalEnrollments: number;
};