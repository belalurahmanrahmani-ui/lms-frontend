export type Lesson = {
  id: number;
  courseId: number;
  title: string;
    description: string | null;
  videoUrl: string | null;
  duration: number;
  order: number;
  isPublished: boolean;
};