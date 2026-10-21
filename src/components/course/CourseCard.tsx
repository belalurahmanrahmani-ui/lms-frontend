import Image from "next/image";
import Link from "next/link";
import { PlayCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { Course } from "@/types/course";

export function CourseCard({ course }: { course: Course }) {
  const isFree = course.price === 0;
  const thumbnailUrl =
    course.thumbnail && course.thumbnail.startsWith("http")
      ? course.thumbnail
      : null;

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      {/* Thumbnail */}
      <div className="relative aspect-video w-full bg-muted">
        {thumbnailUrl ? (
          <Image
            src={thumbnailUrl}
            alt={course.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <PlayCircle className="h-10 w-10" />
          </div>
        )}

        <Badge className="absolute right-3 top-3 bg-primary">
          {course.categoryName}
        </Badge>
      </div>

      {/* Content */}
      <div className="space-y-4 p-4">
        <h3 className="line-clamp-2 font-heading text-lg leading-snug">
          {course.title}
        </h3>

        <div className="flex items-center gap-2">
          <Avatar className="h-7 w-7">
            <AvatarFallback>{course.teacherName.charAt(0)}</AvatarFallback>
          </Avatar>
          <span className="text-sm text-muted-foreground">
            {course.teacherName}
          </span>
        </div>

        <div className="flex items-center justify-between border-t border-border pt-3">
                    <div className="leading-tight">
            <span className="font-heading text-lg text-highlight">
              {isFree ? "Free" : `$${course.price}`}
            </span>
            {!isFree && (
              <p className="text-xs text-muted-foreground">
                Free enrollment for now
              </p>
            )}
          </div>

          <Button
            size="sm"
            nativeButton={false}
            render={<Link href={`/courses/${course.id}`}>View Course</Link>}
          />
        </div>
      </div>
    </div>
  );
}