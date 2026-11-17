import { createContext, ReactNode, useContext, useState } from "react";
import { Role, UserProfile } from "../types/nexo";
import { authenticateWithSupabase, isSupabaseConfigured } from "../lib/supabase";

interface AuthContextType {
  user: UserProfile | null;
  role: Role;
  loginWithEmail: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAdmin: boolean;
  isOperator: boolean;
}

// Cuentas oficiales del sistema para contingencia local
export const SYSTEM_ACCOUNTS = [
  {
    email: "admin@nexo.pe",
    password: "admin123",
    profile: {
      id: "usr-admin-1",
      name: "Marta Gómez",
      email: "admin@nexo.pe",
      role: "ADMINISTRADOR" as Role,
      businessName: "Confecciones & Almacén Gómez",
    },
  },
  {
    email: "operador@nexo.pe",
    password: "operador123",
    profile: {
      id: "usr-oper-1",
      name: "Carlos Rojas",
      email: "operador@nexo.pe",
      role: "OPERADOR" as Role,
      businessName: "Confecciones & Almacén Gómez",
    },
  },
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Siempre inicia en NULL: redirección obligatoria a la pantalla de login
  const [user, setUser] = useState<UserProfile | null>(null);

  const role = user?.role || "OPERADOR";
  const isAdmin = role === "ADMINISTRADOR";
  const isOperator = role === "OPERADOR";

  async function loginWithEmail(email: string, pass: string): Promise<{ success: boolean; error?: string }> {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = pass.trim();

    if (!cleanEmail || !cleanPass) {
      return { success: false, error: "Por favor ingrese correo y contraseña." };
    }

    // 1. Si Supabase está conectado, autenticar con Supabase Auth (contraseñas en la nube)
    if (isSupabaseConfigured) {
      const supaResult = await authenticateWithSupabase(cleanEmail, cleanPass);
      if (supaResult.success && supaResult.user) {
        setUser({
          id: supaResult.user.id,
          name: supaResult.user.name,
          email: supaResult.user.email,
          role: supaResult.user.role,
          businessName: "Confecciones & Almacén Gómez",
        });
        return { success: true };
      } else if (supaResult.error && !supaResult.error.includes("Supabase no configurado")) {
        // Si Supabase rechazó la contraseña, mostrar el error exacto
        return { success: false, error: supaResult.error };
      }
    }

    // 2. Si no hay conexión o no está configurado Supabase, validar cuentas locales
    const account = SYSTEM_ACCOUNTS.find(
      (acc) => acc.email.toLowerCase() === cleanEmail && acc.password === cleanPass
    );

    if (!account) {
      return {
        success: false,
        error: "Correo o contraseña incorrectos. Verifique sus credenciales.",
      };
    }

    setUser(account.profile);
    return { success: true };
  }

  function logout() {
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        loginWithEmail,
        logout,
        isAdmin,
        isOperator,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
}
