
import { Toaster as Sonner } from "sonner"
import { type ToasterProps } from "sonner"

import { cn } from "@/lib/utils"

// Re-export the toast function from sonner
export { toast } from "sonner"

function Toaster({ ...props }: ToasterProps) {
  return (
    <Sonner
      className={cn("toaster group")}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
