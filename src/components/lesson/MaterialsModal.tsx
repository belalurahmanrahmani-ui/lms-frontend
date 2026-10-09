"use client";

import { useEffect, useState } from "react";
import { ExternalLink, FileText, Pencil, Plus, Trash2 } from "lucide-react";
import { Modal } from "@/components/shared/Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { callBackend } from "@/lib/api/browser";
import type { Lesson } from "@/types/lesson";
import type { Material } from "@/types/material";

const iconButton =
  "rounded-md p-1.5 transition-colors hover:bg-accent disabled:opacity-50";

const isSafeUrl = (url: string) => /^https?:\/\//i.test(url);

function MaterialForm({
  lessonId,
  material,
  onDone,
  onCancel,
}: {
  lessonId: number;
  material: Material | null;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [fileName, setFileName] = useState(material?.fileName ?? "");
  const [fileUrl, setFileUrl] = useState(material?.fileUrl ?? "");
  const [fileType, setFileType] = useState(material?.fileType ?? "pdf");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // لینک فایل بعداً برای دانشجوها باز می‌شود؛ فقط http/https مجاز است
    if (!isSafeUrl(fileUrl)) {
      setError("آدرس فایل باید با http:// یا https:// شروع شود");
      return;
    }

    setIsLoading(true);
    const body = { fileName, fileUrl, fileType };

    const result = material
      ? await callBackend(`materials/${material.id}`, "PUT", body)
      : await callBackend(`lessons/${lessonId}/materials`, "POST", body);

    setIsLoading(false);

    if (!result.ok) {
      setError(result.errorMessage);
      return;
    }
    onDone();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="material-name">File Name</Label>
        <Input
          id="material-name"
          required
          minLength={2}
          value={fileName}
          onChange={(e) => setFileName(e.target.value)}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="material-url">File URL</Label>
        <Input
          id="material-url"
          type="url"
          required
          value={fileUrl}
          onChange={(e) => setFileUrl(e.target.value)}
          placeholder="https://..."
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="material-type">File Type</Label>
        <Input
          id="material-type"
          required
          maxLength={20}
          list="material-types"
          value={fileType}
          onChange={(e) => setFileType(e.target.value)}
        />
        <datalist id="material-types">
          <option value="pdf" />
          <option value="docx" />
          <option value="pptx" />
          <option value="xlsx" />
          <option value="zip" />
          <option value="image" />
        </datalist>
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "در حال ذخیره..." : material ? "Save Changes" : "Add Material"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

type FormState = { material: Material | null } | null;

export function MaterialsModal({
  lesson,
  onClose,
}: {
  lesson: Lesson;
  onClose: () => void;
}) {
  const [materials, setMaterials] = useState<Material[] | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [form, setForm] = useState<FormState>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    async function load() {
      const result = await callBackend<Material[]>(
        `lessons/${lesson.id}/materials`,
        "GET"
      );
      if (ignore) return;

      if (result.ok) {
        setMaterials(result.data ?? []);
        setError(null);
      } else {
        setMaterials([]);
        setError(result.errorMessage);
      }
    }

    load();
    return () => {
      ignore = true;
    };
  }, [lesson.id, reloadKey]);

  async function handleDelete(material: Material) {
    if (!window.confirm(`فایل «${material.fileName}» حذف شود؟`)) return;

    setError(null);
    const result = await callBackend(`materials/${material.id}`, "DELETE");

    if (!result.ok) {
      setError(result.errorMessage);
      return;
    }
    setReloadKey((key) => key + 1);
  }

  function handleFormDone() {
    setForm(null);
    setReloadKey((key) => key + 1);
  }

  return (
    <Modal title={`Materials — ${lesson.title.trim()}`} onClose={onClose}>
      {form ? (
        <MaterialForm
          lessonId={lesson.id}
          material={form.material}
          onDone={handleFormDone}
          onCancel={() => setForm(null)}
        />
      ) : (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button size="sm" onClick={() => setForm({ material: null })}>
              <Plus className="h-4 w-4" />
              Add Material
            </Button>
          </div>

          {error && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}

          {materials === null ? (
            <p className="text-sm text-muted-foreground">در حال بارگذاری...</p>
          ) : materials.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              هنوز فایلی برای این درس اضافه نشده است.
            </p>
          ) : (
            <ul className="divide-y divide-border rounded-xl border border-border">
              {materials.map((material) => (
                <li key={material.id} className="flex items-center gap-3 px-3 py-2.5">
                  <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm">{material.fileName}</p>
                    <p className="text-xs uppercase text-muted-foreground">
                      {material.fileType}
                    </p>
                  </div>

                  {isSafeUrl(material.fileUrl) && (
                    <a
                      href={material.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Open"
                      className={`${iconButton} text-muted-foreground`}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}

                  <button
                    type="button"
                    title="Edit"
                    onClick={() => setForm({ material })}
                    className={`${iconButton} text-sky-400`}
                  >
                    <Pencil className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    title="Delete"
                    onClick={() => handleDelete(material)}
                    className={`${iconButton} text-rose-400`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </Modal>
  );
}