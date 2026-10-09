export type Course = {
  id: number;
  title: string;
  description: string;
  thumbnail: string | null;
  price: number;
  isPublished: boolean;
  teacherId: number;
  teacherName: string;
  categoryId: number;
  categoryName: string;
  createdAt: string;
  updatedAt: string;
};
export type LessonSummary = {
  id: number;
  title: string;
  duration: number;
  order: number;
};

export type CourseDetail = {
  id: number;
  title: string;
  description: string;
  thumbnail: string | null;
  price: number;
  teacherName: string;
  categoryName: string;
  lessonCount: number;
  totalDuration: number;
  enrollmentCount: number;
  lessons: LessonSummary[];
};