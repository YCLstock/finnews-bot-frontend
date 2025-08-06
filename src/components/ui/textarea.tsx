import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "placeholder:text-muted-foreground flex field-sizing-content min-h-24 md:min-h-20 w-full rounded-xl border border-border/60 bg-background/80 backdrop-blur-sm px-4 py-3 text-base md:text-sm transition-all duration-200 outline-none disabled:cursor-not-allowed disabled:opacity-50 resize-none",
        "hover:border-border/80 hover:bg-background",
        "focus:border-ring focus:ring-2 focus:ring-ring/20 focus:bg-background",
        "aria-invalid:border-destructive/60 aria-invalid:ring-2 aria-invalid:ring-destructive/20",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
