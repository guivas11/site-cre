"use client";

import { useMemo, useState } from "react";
import { getPasswordStrength } from "@/lib/auth/validation";

const strengthConfig = {
  weak: {
    label: "Senha fraca",
    color: "bg-red-500",
    width: "w-1/3",
  },
  medium: {
    label: "Senha média",
    color: "bg-yellow-400",
    width: "w-2/3",
  },
  strong: {
    label: "Senha forte",
    color: "bg-green-500",
    width: "w-full",
  },
};

export default function PasswordField() {
  const [value, setValue] = useState("");
  const strength = useMemo(() => getPasswordStrength(value), [value]);
  const config = strengthConfig[strength];

  return (
    <div>
      <label className="text-xs uppercase tracking-[0.3em] text-zinc-400">
        Senha
      </label>
      <input
        className="mt-2 w-full rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-white placeholder:text-zinc-500"
        name="password"
        type="password"
        placeholder="Mínimo 8 caracteres"
        minLength={8}
        required
        onChange={(event) => setValue(event.target.value)}
      />
      <p className="mt-2 text-xs text-zinc-500">
        Use 8+ caracteres com maiúscula, minúscula, número e símbolo.
      </p>
      <div className="mt-3 flex items-center gap-3">
        <div className="h-2 flex-1 rounded-full bg-white/10">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${config.color} ${config.width}`}
          />
        </div>
        <span className="text-xs uppercase tracking-[0.3em] text-zinc-400">
          {config.label}
        </span>
      </div>
    </div>
  );
}
