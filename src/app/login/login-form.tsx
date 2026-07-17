"use client";

import { useActionState } from "react";
import { login, type LoginState } from "./actions";

const initialState: LoginState = {};

export default function LoginForm() {
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm text-muted">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="nombre@ey.com"
          className="field py-2.5"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm text-muted">
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          placeholder="••••••••"
          className="field py-2.5"
        />
      </div>

      {state.error && (
        <p className="rounded-lg border border-red-900/50 bg-red-950/40 px-3 py-2 text-sm text-red-300">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-lg bg-ey-yellow px-4 py-2.5 text-sm font-semibold text-black transition hover:brightness-95 disabled:opacity-60"
      >
        {pending ? "Ingresando..." : "Iniciar sesión"}
      </button>
    </form>
  );
}
