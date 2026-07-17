"use client";

import { useFormStatus } from "react-dom";

export default function SubmitButton({
  children,
  pendingText,
  className,
  ariaLabel,
}: {
  children: React.ReactNode;
  pendingText?: string;
  className?: string;
  ariaLabel?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      aria-label={ariaLabel}
      className={`${className} disabled:opacity-60`}
    >
      {pending ? (pendingText ?? "Guardando...") : children}
    </button>
  );
}
