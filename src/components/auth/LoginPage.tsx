import { FormEvent, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Icon } from "../common/Icon";

export function LoginPage() {
  const { loginWithEmail } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    const res = await loginWithEmail(email, password);
    setLoading(false);

    if (!res.success) {
      setErrorMsg(res.error || "Credenciales incorrectas.");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f4f7f6] p-4 sm:p-6">
      <div className="w-full max-w-[440px] overflow-hidden rounded-[28px] border border-[#dce7e5] bg-white p-7 shadow-[0_20px_60px_rgba(20,45,42,.08)] md:p-10">
        {/* Logotipo y Título de NEXO */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-[#00cec8] text-2xl font-bold text-white shadow-[0_8px_20px_rgba(0,206,200,.28)]">
            N
          </div>
          <h1 className="title-font text-[28px] font-semibold text-[#1a3835]">
            Iniciar Sesión
          </h1>
          <p className="mt-1 text-sm text-[#667a77]">
            Sistema de gestión de datos por Casas y Bloques
          </p>
        </div>

        {/* Formulario de Acceso Corporativo Limpio */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMsg && (
            <div className="rounded-xl border border-[#fbd3c6] bg-[#fff2ed] p-3 text-xs font-semibold text-[#b84824]">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-xs font-bold text-[#354c48]" htmlFor="login-email">
              Correo corporativo
            </label>
            <input
              id="login-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nombre@empresa.com"
              className="h-12 w-full rounded-xl border border-[#d3dedc] bg-[#fafcfb] px-4 text-sm text-[#243a37] outline-none transition focus:border-[#00aaa6] focus:bg-white focus:ring-4 focus:ring-[#00cec8]/10"
            />
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-xs font-bold text-[#354c48]" htmlFor="login-pass">
                Contraseña
              </label>
              <a
                href="#help"
                onClick={(e) => {
                  e.preventDefault();
                  alert("Para soporte de acceso o restablecimiento de contraseña, contacte al administrador del sistema.");
                }}
                className="text-[11px] font-semibold text-[#008d89] hover:underline"
              >
                ¿Olvidó su contraseña?
              </a>
            </div>
            <input
              id="login-pass"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="h-12 w-full rounded-xl border border-[#d3dedc] bg-[#fafcfb] px-4 text-sm text-[#243a37] outline-none transition focus:border-[#00aaa6] focus:bg-white focus:ring-4 focus:ring-[#00cec8]/10"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-[#596d6a]">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded-md border-[#cfdcda] text-[#009e9b] focus:ring-0"
              />
              Recordar en este equipo
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#009e9b] text-sm font-bold text-white shadow-[0_6px_20px_rgba(0,158,155,.24)] transition hover:bg-[#008a86] disabled:opacity-60"
          >
            {loading ? (
              <span>Validando credenciales...</span>
            ) : (
              <>
                <span>Ingresar al Sistema</span>
                <Icon name="arrow" className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 border-t border-[#edf3f2] pt-5 text-center">
          <p className="text-[11px] text-[#7b8c89]">
            Nexo Enterprise Platform · Conexión segura TLS 1.3
          </p>
        </div>
      </div>
    </div>
  );
}
