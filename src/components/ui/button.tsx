import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 hover:shadow-md border border-primary/20 rounded-xl",
        destructive:
          "bg-destructive text-white shadow-sm hover:bg-destructive/90 hover:shadow-md focus-visible:ring-destructive/20 rounded-xl border border-destructive/20",
        outline:
          "border border-border bg-background/80 shadow-sm hover:bg-accent/50 hover:text-accent-foreground hover:shadow-md hover:border-border/80 rounded-xl backdrop-blur-sm",
        secondary:
          "bg-secondary/80 text-secondary-foreground shadow-sm hover:bg-secondary hover:shadow-md rounded-xl border border-border/30 backdrop-blur-sm",
        ghost:
          "hover:bg-accent/50 hover:text-accent-foreground rounded-xl",
        link: "text-primary underline-offset-4 hover:underline rounded-lg",
      },
      size: {
        default: "h-11 md:h-10 px-5 py-2.5 has-[>svg]:px-4 text-base md:text-sm",
        sm: "h-9 md:h-8 px-3 py-2 gap-1.5 has-[>svg]:px-2.5 text-sm md:text-xs",
        lg: "h-12 px-7 py-3 has-[>svg]:px-6 text-base",
        icon: "size-11 md:size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
