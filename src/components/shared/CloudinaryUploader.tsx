"use client";

import { useEffect, useRef, useState } from "react";
import { ExternalLink, FileText, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

type Kind = "image" | "video" | "file";

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

const rules: Record<
  Kind,
  { accept: string; maxMb: number; hint: string; resourceType: string }
> = {
  image: {
    accept: "image/jpeg,image/png,image/webp",
    maxMb: 5,
    hint: "JPG, PNG یا WEBP، حداکثر 5MB",
    resourceType: "image",
  },
  video: {
    accept: "video/mp4",
    maxMb: 100,
    hint: "فقط MP4، حداکثر 100MB",
    resourceType: "video",
  },
  file: {
    accept: ".pdf,.docx,.pptx,.xlsx,.zip",
    maxMb: 20,
    hint: "PDF, DOCX, PPTX, XLSX یا ZIP، حداکثر 20MB",
    resourceType: "auto",
  },
};

function isAllowed(file: File, kind: Kind) {
  const accepted = rules[kind].accept.split(",");
  if (kind === "file") {
    // MIME فایل‌های آفیس در مرورگرها یکدست نیست، پس پسوند را چک می‌کنیم
    const extension = "." + (file.name.split(".").pop() ?? "").toLowerCase();
    return accepted.includes(extension);
  }
  return accepted.includes(file.type);
}

function uploadToCloudinary(
  file: File,
  kind: Kind,
  onProgress: (percent: number) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET as string);

    const xhr = new XMLHttpRequest();
    xhr.open(
      "POST",
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${rules[kind].resourceType}/upload`
    );

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      try {
        const response = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300 && response.secure_url) {
          resolve(response.secure_url as string);
        } else {
          reject(new Error(response.error?.message ?? "آپلود ناموفق بود"));
        }
      } catch {
        reject(new Error("آپلود ناموفق بود"));
      }
    };

    xhr.onerror = () => reject(new Error("خطای شبکه؛ اینترنت را بررسی کنید"));
    xhr.send(formData);
  });
}

export function CloudinaryUploader({
  kind,
  value,
  onChange,
  onBusyChange,
  onFileInfo,
  disabled = false,
}: {
  kind: Kind;
  value: string | null;
  onChange: (url: string | null) => void;
  onBusyChange?: (busy: boolean) => void;
  onFileInfo?: (file: File) => void;
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const rule = rules[kind];
  const isUploading = progress !== null;

  useEffect(() => {
    onBusyChange?.(isUploading);
  }, [isUploading, onBusyChange]);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // اجازهٔ انتخاب دوبارهٔ همان فایل
    if (!file) return;

    setError(null);

    if (!CLOUD_NAME || !UPLOAD_PRESET) {
      setError("تنظیمات Cloudinary در .env.local کامل نیست");
      return;
    }
    if (!isAllowed(file, kind)) {
      setError(`فرمت فایل مجاز نیست (${rule.hint})`);
      return;
    }
    if (file.size > rule.maxMb * 1024 * 1024) {
      setError(`حجم فایل بیشتر از ${rule.maxMb}MB است`);
      return;
    }

    setProgress(0);
    try {
      const url = await uploadToCloudinary(file, kind, setProgress);
      onChange(url);
      onFileInfo?.(file);
    } catch (err) {
      setError(err instanceof Error ? err.message : "آپلود ناموفق بود");
    } finally {
      setProgress(null);
    }
  }

  return (
    <div className="space-y-3">
      {value && kind === "image" && (
        <div className="overflow-hidden rounded-xl border border-border bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="Preview"
            className="aspect-video w-full object-cover"
          />
        </div>
      )}

      {value && kind === "video" && (
        <div className="overflow-hidden rounded-xl border border-border bg-muted">
          <video
            src={value}
            controls
            className="aspect-video w-full bg-black"
          />
        </div>
      )}

      {value && kind === "file" && (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-xl border border-border bg-muted px-3 py-2 text-sm hover:bg-accent"
        >
          <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span className="min-w-0 flex-1 truncate">Uploaded file</span>
          <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground" />
        </a>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={rule.accept}
        onChange={handleFile}
        className="hidden"
      />

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled || isUploading}
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="mr-1.5 h-4 w-4" />
          {isUploading
            ? `Uploading ${progress}%`
            : value
              ? "Replace file"
              : "Choose file"}
        </Button>

        {value && !isUploading && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={disabled}
            onClick={() => onChange(null)}
          >
            Remove
          </Button>
        )}
      </div>

      {isUploading && (
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      <p className="text-xs text-muted-foreground">{rule.hint}</p>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}