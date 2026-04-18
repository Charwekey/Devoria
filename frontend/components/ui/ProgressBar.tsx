"use client";

import { useEffect, useState } from "react";

interface ProgressBarProps {
  percentage: number;
  label?: string;
}

export function ProgressBar({ percentage, label }: ProgressBarProps) {
  const [width, setWidth] = useState(0);

  // Animate on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setWidth(percentage > 100 ? 100 : percentage < 0 ? 0 : percentage);
    }, 100);
    return () => clearTimeout(timer);
  }, [percentage]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", width: "100%" }}>
      {label && (
        <div className="flex-between">
          <span className="text-small" style={{ fontWeight: 600 }}>{label}</span>
          <span className="text-small" style={{ fontWeight: 600, color: "var(--color-primary-dark)" }}>{percentage}%</span>
        </div>
      )}
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}
