import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";
import type { ButtonHTMLAttributes } from "react";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors duration-150 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest",
  {
    variants: {
      variant: {
        primary: "bg-forest text-cream hover:bg-forest-dark",
        secondary: "bg-ink text-cream hover:bg-ink/90",
        outline: "border border-line bg-cream text-ink hover:bg-paper",
        ghost: "text-ink hover:bg-ink/5",
        danger: "bg-danger text-cream hover:bg-danger/90",
      },
      size: {
        sm: "h-9 px-3 text-sm",
        md: "h-11 px-4 text-sm",
        lg: "h-12 px-5 text-[15px]",
        icon: "size-11",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export function Button({
  className,
  variant,
  size,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
