// Cliente de conexión oficial con Supabase (PostgreSQL en la nube)
// Soporta la nueva nomenclatura VITE_SUPABASE_PUBLISHABLE_KEY y VITE_SUPABASE_ANON_KEY

export const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL || "").trim().replace(/\/$/, "");
export const SUPABASE_KEY = (
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 
  import.meta.env.VITE_SUPABASE_ANON_KEY || 
  ""
).trim();

export const isSupabaseConfigured = Boolean(
  SUPABASE_URL && 
  SUPABASE_KEY && 
  !SUPABASE_URL.includes("placeholder")
);

// Autenticación real con Supabase Auth (Verificación de contraseña encriptada)
export async function authenticateWithSupabase(email: string, pass: string): Promise<{
  success: boolean;
  user?: { id: string; email: string; name: string; role: "ADMINISTRADOR" | "OPERADOR" };
  error?: string;
}> {
  if (!isSupabaseConfigured) {
    return { success: false, error: "Supabase no configurado" };
  }

  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: {
        "apikey": SUPABASE_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password: pass }),
    });

    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error_description || data.msg || "Credenciales incorrectas en Supabase." };
    }

    const authUserId = data.user.id;

    // Obtener rol desde la tabla perfiles
    const profileRes = await fetch(`${SUPABASE_URL}/rest/v1/perfiles?id=eq.${authUserId}&select=*`, {
      headers: {
        "apikey": SUPABASE_KEY,
        "Authorization": `Bearer ${data.access_token}`,
      },
    });

    let role: "ADMINISTRADOR" | "OPERADOR" = email.toLowerCase().includes("oper") ? "OPERADOR" : "ADMINISTRADOR";
    let name = data.user.user_metadata?.nombre || (email.split("@")[0]);

    if (profileRes.ok) {
      const profiles = await profileRes.json();
      if (profiles && profiles.length > 0) {
        role = profiles[0].rol;
        name = profiles[0].nombre;
      }
    }

    return {
      success: true,
      user: {
        id: authUserId,
        email: data.user.email,
        name,
        role,
      },
    };
  } catch (err: any) {
    console.warn("Error conectando con Supabase Auth:", err);
    return { success: false, error: err.message || "Error de red con Supabase" };
  }
}

// Helper para sincronizar tablas en Supabase
export async function syncWithSupabase<T>(table: string, action: "select" | "insert" | "update" | "delete", payload?: any): Promise<T | null> {
  if (!isSupabaseConfigured) return null;
  try {
    const headers = {
      "apikey": SUPABASE_KEY,
      "Authorization": `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      "Prefer": "return=representation",
    };

    let url = `${SUPABASE_URL}/rest/v1/${table}`;
    let method = "GET";

    if (action === "insert") {
      method = "POST";
    } else if (action === "update") {
      method = "PATCH";
      if (payload?.id) url += `?id=eq.${payload.id}`;
    } else if (action === "delete") {
      method = "DELETE";
      if (payload?.id) url += `?id=eq.${payload.id}`;
    }

    const res = await fetch(url, {
      method,
      headers,
      body: payload && action !== "select" && action !== "delete" ? JSON.stringify(payload) : undefined,
    });

    if (!res.ok) throw new Error(`Supabase error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn(`[Supabase Sync Warning] Operando local:`, err);
    return null;
  }
}
