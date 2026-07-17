"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

export interface SelectOption {
  value: string;
  label: string;
}

export default function SelectField({
  name,
  options,
  defaultValue,
  value,
  onChange,
  placeholder,
  disabled,
  compact,
  className,
}: {
  name?: string;
  options: SelectOption[];
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  compact?: boolean;
  className?: string;
}) {
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue ?? "");
  const selected = isControlled ? value : internalValue;
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  const selectedOption = options.find((o) => o.value === selected);

  function handleSelect(e: React.MouseEvent, v: string) {
    e.preventDefault();
    e.stopPropagation();
    if (!isControlled) setInternalValue(v);
    onChange?.(v);
    setOpen(false);
  }

  return (
    <div ref={rootRef} className={`relative ${className ?? ""}`}>
      {name && <input type="hidden" name={name} value={selected} />}
      <button
        type="button"
        disabled={disabled}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        className={`flex w-full items-center justify-between gap-2 rounded-lg border border-border bg-surface-2 text-left text-foreground outline-none transition-colors duration-150 hover:border-muted/50 focus:border-ey-yellow focus:ring-2 focus:ring-ey-yellow/20 disabled:opacity-50 ${
          compact ? "px-2 py-1 text-xs" : "px-3 py-2 text-sm"
        }`}
      >
        <span className={selectedOption ? "" : "text-muted"}>
          {selectedOption ? selectedOption.label : (placeholder ?? "Seleccionar...")}
        </span>
        <ChevronDown
          className={`h-3.5 w-3.5 shrink-0 text-muted transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      <div
        className={`absolute z-20 mt-1 w-full origin-top rounded-lg border border-border bg-surface-2 p-1 shadow-lg shadow-black/30 transition duration-150 ease-out ${
          open ? "pointer-events-auto scale-100 opacity-100" : "pointer-events-none scale-95 opacity-0"
        }`}
      >
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={(e) => handleSelect(e, opt.value)}
            className="flex w-full items-center justify-between gap-2 rounded-md px-2.5 py-1.5 text-left text-sm text-foreground transition-colors duration-100 hover:bg-surface"
          >
            {opt.label}
            {opt.value === selected && <Check className="h-3.5 w-3.5 text-ey-yellow" />}
          </button>
        ))}
      </div>
    </div>
  );
}
