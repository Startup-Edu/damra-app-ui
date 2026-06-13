import * as React from "react"
import { cn } from "@/lib/utils"

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string
}

export function Avatar({ name, className, ...props }: AvatarProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <div
      data-slot="avatar"
      className={cn(
        "flex items-center justify-center h-9 w-9 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-semibold uppercase shrink-0",
        className
      )}
      {...props}
    >
      {initials}
    </div>
  )
}
