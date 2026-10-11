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