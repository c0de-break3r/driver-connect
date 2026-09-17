"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface AvatarProps extends React.ComponentProps<"div"> {
  src?: string;
  alt?: string;
  fallback?: string;
}

function Avatar({ className, src, alt, fallback, ...props }: AvatarProps) {
  const [imageError, setImageError] = React.useState(false);

  return (
    <div
      className={cn("relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full", className)}
      {...props}
    >
      {src && !imageError ? (
        <img
          src={src}
          alt={alt || ""}
          className="aspect-square h-full w-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center rounded-full bg-muted text-sm font-medium text-secondary">
          {fallback || alt?.charAt(0).toUpperCase() || "?"}
        </div>
      )}
    </div>
  );
}

export { Avatar };
