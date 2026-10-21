"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { callBackend } from "@/lib/api/browser";

export function EnrollButton({ courseId }: { courseId: number }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleEnroll() {
    setError(null);
    setIsLoading(true);

    const result = await callBackend(`courses/${courseId}/enroll`, "POST");

    setIsLoading(false);

    if (!result.ok) {
      setError(result.errorMessage);
      return;
    }

    router.push(`/student/courses/${courseId}`);
    router.refresh();
  }

  return (
    <div className="space-y-2">
      <Button type="button" className="w-full" onClick={handleEnroll} disabled={isLoading}>
        {isLoading ? "Enrolling..." : "Enroll Now"}
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}