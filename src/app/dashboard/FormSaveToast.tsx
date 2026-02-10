"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type FormSaveToastProps = {
  formId: string;
};

export default function FormSaveToast({ formId }: FormSaveToastProps) {
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [initialValues, setInitialValues] = useState<Record<string, string>>(
    {},
  );
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const form = document.getElementById(formId) as HTMLFormElement | null;
    if (!form) return;

    const collectInitials = () => {
      const values: Record<string, string> = {};
      const fields = form.querySelectorAll<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >("input[name], textarea[name], select[name]");
      const externalFields = document.querySelectorAll<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >(`[form=\"${formId}\"][name]`);
      fields.forEach((field) => {
        values[field.name] = field.value;
      });
      externalFields.forEach((field) => {
        values[field.name] = field.value;
      });
      setInitialValues(values);
    };

    const handleChange = (event: Event) => {
      setDirty(true);
      const target = event.target as HTMLInputElement | HTMLTextAreaElement | null;
      if (!target) return;
      if (
        target.name === "display_name" ||
        target.name === "username" ||
        target.name === "favorite_track"
      ) {
        window.dispatchEvent(
          new CustomEvent("profile-field-updated", {
            detail: { name: target.name, value: target.value },
          }),
        );
      }
    };
    const handleSubmit = () => {
      setSaving(true);
      setTimeout(() => {
        setSaving(false);
        setDirty(false);
        collectInitials();
      }, 1500);
    };

    collectInitials();
    form.addEventListener("input", handleChange, true);
    form.addEventListener("change", handleChange, true);
    form.addEventListener("submit", handleSubmit);

    const handleImageChange = (event: Event) => {
      setDirty(true);
      const detail = (event as CustomEvent<{
        name: string;
        url?: string;
        previous?: string;
      }>).detail;
      if (!detail?.name) return;
      if (detail.previous !== undefined) {
        setInitialValues((current) => {
          const hasValue = Object.prototype.hasOwnProperty.call(
            current,
            detail.name,
          );
          if (hasValue && current[detail.name] !== "") return current;
          return { ...current, [detail.name]: detail.previous ?? "" };
        });
      }
    };
    window.addEventListener("profile-image-updated", handleImageChange);

    return () => {
      form.removeEventListener("input", handleChange, true);
      form.removeEventListener("change", handleChange, true);
      form.removeEventListener("submit", handleSubmit);
      window.removeEventListener("profile-image-updated", handleImageChange);
    };
  }, [formId]);

  if (!dirty && !saving) return null;

  const toast = (
    <div className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-full border border-white/10 bg-black/80 px-4 py-2 text-xs uppercase tracking-[0.28em] text-zinc-200 shadow-[0_10px_30px_-20px_rgba(0,0,0,0.8)] backdrop-blur animate-toast-in">
      <span className="text-[10px] tracking-[0.3em] text-zinc-400">
        {saving ? "Salvando..." : "Alterações pendentes"}
      </span>
      <button
        type="button"
        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-zinc-300 transition hover:border-white/30 hover:text-white"
        aria-label="Desfazer alterações"
        title="Desfazer"
        onClick={() => {
          const form = document.getElementById(formId) as HTMLFormElement | null;
          if (!form) return;
          const fields = form.querySelectorAll<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
          >("input[name], textarea[name], select[name]");
          const externalFields = document.querySelectorAll<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
          >(`[form=\"${formId}\"][name]`);
          fields.forEach((field) => {
            const next = initialValues[field.name] ?? "";
            field.value = next;
            if (
              field.name === "display_name" ||
              field.name === "username" ||
              field.name === "favorite_track"
            ) {
              window.dispatchEvent(
                new CustomEvent("profile-field-updated", {
                  detail: { name: field.name, value: next },
                }),
              );
            }
            if (
              field.name === "avatar_url" ||
              field.name === "banner_url" ||
              field.name === "favorite_track_image"
            ) {
              window.dispatchEvent(
                new CustomEvent("profile-image-updated", {
                  detail: { name: field.name, url: next },
                }),
              );
            }
          });
          externalFields.forEach((field) => {
            const next = initialValues[field.name] ?? "";
            field.value = next;
            if (
              field.name === "avatar_url" ||
              field.name === "banner_url" ||
              field.name === "favorite_track_image"
            ) {
              window.dispatchEvent(
                new CustomEvent("profile-image-updated", {
                  detail: { name: field.name, url: next },
                }),
              );
            }
          });
          setDirty(false);
        }}
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
          <path d="M9 14l-4-4 4-4" />
          <path d="M5 10h9a4 4 0 0 1 0 8h-1" />
        </svg>
      </button>
      <button
        type="button"
        className="inline-flex items-center gap-2 rounded-full border border-yellow-300/50 bg-yellow-300/10 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-yellow-200 transition hover:-translate-y-0.5 hover:border-yellow-300 hover:bg-yellow-300/20 active:translate-y-0"
        onClick={() => {
          const form = document.getElementById(formId) as HTMLFormElement | null;
          form?.requestSubmit();
        }}
      >
        Salvar
      </button>
    </div>
  );

  if (!mounted) return null;
  return createPortal(toast, document.body);
}



