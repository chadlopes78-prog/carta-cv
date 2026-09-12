import { cn } from "@/lib/cn";
import type { InputHTMLAttributes, LabelHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-md border border-line bg-cream px-3 text-ink outline-none transition-shadow placeholder:text-faint focus:border-forest focus:shadow-[0_0_0_3px_rgba(31,92,69,0.15)]",
        className,
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-28 w-full rounded-md border border-line bg-cream px-3 py-2.5 text-ink outline-none transition-shadow placeholder:text-faint focus:border-forest focus:shadow-[0_0_0_3px_rgba(31,92,69,0.15)]",
        className,
      )}
      {...props}
    />
  );
}

export function Label({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("mb-1.5 block text-sm font-medium text-ink", className)} {...props} />;
}

export function FieldHint({ children }: { children: ReactNode }) {
  return <p className="mt-1 text-xs text-muted">{children}</p>;
}
