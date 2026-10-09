"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/shared/Modal";
import { LessonForm } from "@/components/lesson/LessonForm";

export function AddLessonButton({
  courseId,
  defaultOrder,
}: {
  courseId: number;
  defaultOrder: number;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button size="sm" onClick={() => setIsOpen(true)}>
        <Plus className="h-4 w-4" />
        Add Lesson
      </Button>

      {isOpen && (
        <Modal title="Add Lesson" onClose={() => setIsOpen(false)}>
          <LessonForm
            mode="create"
            courseId={courseId}
            defaultOrder={defaultOrder}
            onDone={() => setIsOpen(false)}
          />
        </Modal>
      )}
    </>
  );
}