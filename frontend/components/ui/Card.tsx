import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  hoverEffect?: boolean;
}

export function Card({ children, className = "", hoverEffect = false }: CardProps) {
  return (
    <div className={`glass-panel ${hoverEffect ? "hover-lift" : ""} ${className}`} style={{ padding: "2rem" }}>
      {children}
    </div>
  );
}
