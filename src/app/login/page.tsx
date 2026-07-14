import LoginForm from "./login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded bg-ey-yellow text-sm font-extrabold text-black">
            EY
          </div>
          <div>
            <p className="text-sm font-semibold leading-tight">PAS Hub</p>
            <p className="text-xs text-muted leading-tight">
              People Advisory Services
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-6">
          <h1 className="mb-1 text-lg font-semibold">Iniciar sesión</h1>
          <p className="mb-6 text-sm text-muted">
            Accede con tu email y contraseña de EY.
          </p>
          <LoginForm />
        </div>

        <p className="mt-4 text-center text-xs text-muted">
          Task-it + EY Knowledge Hub — PAS Venezuela
        </p>
      </div>
    </div>
  );
}
