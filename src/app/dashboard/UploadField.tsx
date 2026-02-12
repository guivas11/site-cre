"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type UploadFieldProps = {
  label: string;
  name: string;
  bucket: string;
  userId: string;
  defaultValue?: string | null;
  helper?: string;
  tileClass?: string;
  imageClass?: string;
  variant?: "tile" | "icon";
  showPreview?: boolean;
  hideLabel?: boolean;
  formId?: string;
};

export default function UploadField({
  label,
  name,
  bucket,
  userId,
  defaultValue,
  helper,
  tileClass = "h-28",
  imageClass = "object-cover",
  variant = "tile",
  showPreview = true,
  hideLabel = false,
  formId,
}: UploadFieldProps) {
  const [value, setValue] = useState(defaultValue ?? "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<{ name: string; url: string }>).detail;
      if (!detail?.name) return;
      if (detail.name === name) {
        setValue(detail.url || "");
        setFileName("");
      }
    };
    window.addEventListener("profile-image-updated", handler as EventListener);
    return () =>
      window.removeEventListener("profile-image-updated", handler as EventListener);
  }, [name]);

  const handleUpload = async (file: File) => {
    setError(null);
    setUploading(true);
    const previousValue = value;
    try {
      const supabase = createClient();
      const safeName = file.name.replace(/[^\w.-]+/g, "_");
      const path = `${userId}/${Date.now()}_${safeName}`;
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(path, file, { upsert: true });

      if (uploadError) {
        setError(uploadError.message);
        return;
      }

      const { data } = supabase.storage.from(bucket).getPublicUrl(path);
      setValue(data.publicUrl);
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("profile-image-updated", {
            detail: { name, url: data.publicUrl, previous: previousValue },
          }),
        );
      }
    } finally {
      setUploading(false);
    }
  };

  if (variant === "icon") {
    return (
      <div className="flex items-center gap-2">
        <input type="hidden" name={name} value={value} form={formId} />
        <label
          className="group inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-white/15 bg-black/60 text-zinc-300 shadow-[0_0_0_1px_rgba(255,255,255,0.04)] transition hover:border-yellow-300/60 hover:text-yellow-200 hover:shadow-[0_0_0_2px_rgba(253,224,71,0.35)] active:scale-95"
          title={label}
        >
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <rect x="3" y="3" width="18" height="18" rx="3" />
            <path d="M7 15l3-3 3 3 4-4 3 3" />
            <circle cx="9" cy="9" r="1.5" />
          </svg>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            form={formId}
            ref={fileInputRef}
            onClick={() => {
              if (fileInputRef.current) {
                fileInputRef.current.value = "";
              }
            }}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              setFileName(file.name);
              handleUpload(file);
            }}
          />
        </label>
        {!hideLabel ? (
          <span className="text-[10px] uppercase tracking-[0.28em] text-zinc-500">
            {uploading ? "Enviando" : fileName || label}
          </span>
        ) : null}
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
      <label className="text-xs uppercase tracking-[0.3em] text-zinc-400">
        {label}
      </label>
      <input type="hidden" name={name} value={value} form={formId} />
      <div className="mt-2 flex flex-col gap-3 rounded-2xl border border-white/10 bg-black/50 p-4">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[11px] uppercase tracking-[0.28em] text-zinc-500">
            {fileName || "Clique na imagem para trocar"}
          </span>
          <span className="rounded-full border border-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-zinc-400">
            {uploading ? "Enviando..." : value ? "Enviado" : "Sem imagem"}
          </span>
        </div>
        {showPreview ? (
          <label className="group relative cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-black/60">
            {value ? (
              <img
                src={value}
                alt={label}
                className={`${tileClass} w-full ${imageClass}`}
              />
            ) : (
              <div
                className={`${tileClass} flex w-full items-center justify-center text-xs uppercase tracking-[0.3em] text-zinc-500`}
              >
                Sem imagem
              </div>
            )}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/0 text-yellow-300 opacity-0 transition group-hover:bg-black/40 group-hover:opacity-100">
              <svg
                className="h-6 w-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M12 5v14" />
                <path d="M5 12h14" />
              </svg>
            </div>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              form={formId}
              ref={fileInputRef}
              onClick={() => {
                if (fileInputRef.current) {
                  fileInputRef.current.value = "";
                }
              }}
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                setFileName(file.name);
                handleUpload(file);
              }}
            />
          </label>
        ) : (
          <label className="group inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/10 bg-black/60 px-4 py-2 text-[10px] uppercase tracking-[0.28em] text-zinc-400 transition hover:border-yellow-300/60 hover:text-yellow-200">
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M12 5v14" />
              <path d="M5 12h14" />
            </svg>
            Selecionar
            <input
              type="file"
              accept="image/*"
              className="hidden"
              form={formId}
              ref={fileInputRef}
              onClick={() => {
                if (fileInputRef.current) {
                  fileInputRef.current.value = "";
                }
              }}
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                setFileName(file.name);
                handleUpload(file);
              }}
            />
          </label>
        )}
        {helper ? (
          <p className="text-xs text-zinc-500">{helper}</p>
        ) : null}
        {error ? (
          <p className="text-xs text-red-300">{error}</p>
        ) : null}
      </div>
    </div>
  );
}

