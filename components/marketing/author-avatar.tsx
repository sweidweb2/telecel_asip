"use client";

import { useState } from "react";
import Image from "next/image";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

type AuthorAvatarSize = "default" | "sm" | "lg";

const SIZE_PX: Record<AuthorAvatarSize, number> = {
  sm: 24,
  default: 32,
  lg: 40,
};

type AuthorAvatarProps = {
  name: string;
  src?: string | null;
  size?: AuthorAvatarSize;
  className?: string;
};

function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
}

export function AuthorAvatar({
  name,
  src,
  size = "default",
  className,
}: AuthorAvatarProps) {
  const [hasError, setHasError] = useState(false);
  const px = SIZE_PX[size];
  const showImage = Boolean(src) && !hasError;

  return (
    <Avatar size={size} className={cn("overflow-hidden", className)}>
      {showImage ? (
        <Image
          src={src!}
          alt=""
          width={px}
          height={px}
          className="aspect-square size-full rounded-full object-cover"
          sizes={`${px}px`}
          onError={() => setHasError(true)}
        />
      ) : (
        <AvatarFallback>{initialsFromName(name)}</AvatarFallback>
      )}
    </Avatar>
  );
}