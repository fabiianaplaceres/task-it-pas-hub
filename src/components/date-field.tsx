"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from "lucide-react";

const DIAS_SEMANA = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sá", "Do"];
const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

function parseISO(value: string) {
  const [y, m, d] = value.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

function toISO(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatDisplay(date: Date) {
  return date.toLocaleDateString("es-VE", { day: "2-digit", month: "short", year: "numeric" });
}

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export default function DateField({
  name,
  defaultValue,
  placeholder = "Seleccionar fecha",
  className,
}: {
  name: string;
  defaultValue?: string;
  placeholder?: string;
  className?: string;
}) {
  const initial = defaultValue ? parseISO(defaultValue) : null;
  const [selected, setSelected] = useState<Date | null>(initial);
  const [viewDate, setViewDate] = useState<Date>(initial ?? new Date());
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

  const hoy = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const semanas = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const startOffset = (new Date(year, month, 1).getDay() + 6) % 7; // semana empieza lunes

    const dias: Date[] = [];
    for (let i = 0; i < 42; i++) {
      dias.push(new Date(year, month, 1 - startOffset + i));
    }
    const filas: Date[][] = [];
    for (let i = 0; i < dias.length; i += 7) {
      filas.push(dias.slice(i, i + 7));
    }
    return filas;
  }, [viewDate]);

  function handleSelect(e: React.MouseEvent, date: Date) {
    e.preventDefault();
    e.stopPropagation();
    setSelected(date);
    setOpen(false);
  }

  function handleClear(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setSelected(null);
  }

  return (
    <div ref={rootRef} className={`relative ${className ?? ""}`}>
      <input type="hidden" name={name} value={selected ? toISO(selected) : ""} />

      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        className="field flex w-full items-center gap-2 pr-8 text-left"
      >
        <CalendarIcon className="h-3.5 w-3.5 shrink-0 text-muted" />
        <span className={selected ? "" : "text-muted"}>
          {selected ? formatDisplay(selected) : placeholder}
        </span>
      </button>

      {selected && (
        <button
          type="button"
          aria-label="Limpiar fecha"
          onClick={handleClear}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted transition-colors duration-150 hover:bg-surface hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}

      <div
        className={`absolute z-20 mt-1 w-64 origin-top rounded-lg border border-border bg-surface-2 p-3 shadow-lg shadow-black/30 transition duration-150 ease-out ${
          open
            ? "pointer-events-auto scale-100 opacity-100"
            : "pointer-events-none scale-95 opacity-0"
        }`}
      >
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
            }}
            className="rounded-md p-1 text-muted transition-colors duration-150 hover:bg-surface hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-xs font-medium">
            {MESES[viewDate.getMonth()]} {viewDate.getFullYear()}
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));
            }}
            className="rounded-md p-1 text-muted transition-colors duration-150 hover:bg-surface hover:text-foreground"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-2 grid grid-cols-7 gap-1 text-center text-[10px] text-muted">
          {DIAS_SEMANA.map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>

        <div className="mt-1 grid grid-cols-7 gap-1">
          {semanas.flat().map((dia, i) => {
            const fueraDeMes = dia.getMonth() !== viewDate.getMonth();
            const esSeleccionado = selected && sameDay(dia, selected);
            const esHoy = sameDay(dia, hoy);
            return (
              <button
                key={i}
                type="button"
                onClick={(e) => handleSelect(e, dia)}
                className={`flex h-7 w-7 items-center justify-center rounded-md text-xs transition-colors duration-100 ${
                  esSeleccionado
                    ? "bg-ey-yellow font-medium text-black"
                    : fueraDeMes
                      ? "text-muted/40 hover:bg-surface"
                      : esHoy
                        ? "border border-ey-yellow/50 text-foreground hover:bg-surface"
                        : "text-foreground hover:bg-surface"
                }`}
              >
                {dia.getDate()}
              </button>
            );
          })}
        </div>

        <div className="mt-2 flex items-center justify-between border-t border-border pt-2">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setSelected(hoy);
              setViewDate(hoy);
            }}
            className="text-xs text-ey-yellow hover:underline"
          >
            Hoy
          </button>
          {selected && (
            <button
              type="button"
              onClick={handleClear}
              className="text-xs text-muted transition-colors duration-150 hover:text-foreground"
            >
              Limpiar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
