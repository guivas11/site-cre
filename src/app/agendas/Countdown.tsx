"use client";

import { useEffect, useState } from "react";

function formatDiff(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  return { days, hours, minutes };
}

export default function Countdown({ target }: { target: string }) {
  const [diff, setDiff] = useState(() =>
    formatDiff(new Date(target).getTime() - Date.now()),
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setDiff(formatDiff(new Date(target).getTime() - Date.now()));
    }, 60000);
    return () => clearInterval(interval);
  }, [target]);

  return (
    <div className="flex items-center gap-4 text-xs uppercase tracking-[0.3em] text-yellow-300">
      <span>{diff.days}d</span>
      <span>{diff.hours}h</span>
      <span>{diff.minutes}m</span>
    </div>
  );
}
