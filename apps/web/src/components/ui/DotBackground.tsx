import { cn } from "@/lib/utils";
import React from "react";

interface DotBackgroundProps {
  children?: React.ReactNode;
  className?: string;
  showBackground?: boolean;
}

export function DotBackground({ children, className, showBackground = true }: DotBackgroundProps) {
  if (!showBackground) {
    return <div className={cn("w-full h-full", className)}>{children}</div>;
  }

  return (
    <div className={cn("relative flex h-full w-full bg-neutral-200 dark:bg-neutral-950", className)}>
      <div
        className={cn(
          "absolute inset-0 pointer-events-none",
          "bg-size-[20px_20px]",
          "bg-[radial-gradient(#d4d4d4_1px,transparent_1px)]",
          "dark:bg-[radial-gradient(#404040_1px,transparent_1px)]",
        )}
      />
      {/* Radial gradient for the container to give a faded look */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-neutral-200 mask-[radial-gradient(ellipse_at_center,transparent_20%,black)] dark:bg-neutral-950"></div>

      <div className="relative z-20 w-full h-full">{children}</div>
    </div>
  );
}
