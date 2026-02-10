"use client";

import { useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type ClipUploadProps = {
  userId: string;
};

export default function ClipUpload({ userId }: ClipUploadProps) {
  const supabase = useMemo(() => createClient(), []);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [clipUrl, setClipUrl] = useState<string>("");

  const handleUpload = async (file: File) => {
    setError(null);
    setUploading(true);
    try {
      const safeName = file.name.replace(/[^\w.-]+/g, "_");
      const path = `${userId}/${Date.now()}_${safeName}`;
      const { error: uploadError } = await supabase.storage
        .from("race-clips")
        .upload(path, file, { upsert: true });

      if (uploadError) {
        setError(uploadError.message);
        return;
      }

      const { data } = supabase.storage.from("race-clips").getPublicUrl(path);
      setClipUrl(data.publicUrl);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
      <label className="text-xs uppercase tracking-[0.3em] text-zinc-400">
        Upload do clip (ate 10 min)
      </label>
      <input type="hidden" name="clip_url" value={clipUrl} />
      <div className="mt-2 flex flex-col gap-3 rounded-2xl border border-white/10 bg-black/50 p-4">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[11px] uppercase tracking-[0.28em] text-zinc-500">
            {fileName || "Selecione um video"}
          </span>
          <span className="rounded-full border border-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-zinc-400">
            {uploading ? "Enviando..." : clipUrl ? "Enviado" : "Sem video"}
          </span>
        </div>
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
          Selecionar video
          <input
            type="file"
            accept="video/*"
            className="hidden"
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
        {error ? <p className="text-xs text-red-300">{error}</p> : null}
      </div>
    </div>
  );
}
