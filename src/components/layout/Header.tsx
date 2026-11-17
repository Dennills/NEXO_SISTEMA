import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNexo } from "../../context/NexoContext";
import { Icon } from "../common/Icon";

export function Header({
  onNavigate,
  onOpenCreateHouse,
}: {
  onNavigate: (route: string) => void;
  onOpenCreateHouse: () => void;
}) {
  const { user, role, logout, isAdmin } = useAuth();
  const { houses, activeHouseId, setActiveHouseId } = useNexo();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const activeHouse = houses.find((h) => h.id === activeHouseId) || houses[0];

  return (
    <header className="fixed inset-x-0 top-0 z-30 flex h-[74px] items-center justify-between border-b border-[#dde8e6] bg-white px-4 md:px-8">
      {/* Logotipo y Casa activa */}
      <div className="flex items-center gap-6">
        <button
          onClick={() => onNavigate("houses")}
          className="flex items-center gap-3 text-left transition hover:opacity-90"
          aria-label="Ir a Mis Casas"
        >
          <span className="grid h-10 w-10 place-items-center rounded-[14px] bg-[#00cec8] text-xl font-bold text-white shadow-xs">
            N
          </span>
          <span className="title-font text-[24px] font-semibold tracking-[-0.03em] text-[#173c3a]">
            Nexo
          </span>
        </button>

        {/* Selector de Casa activa */}
        <div className="hidden items-center gap-2 border-l border-[#e4eeec] pl-6 md:flex">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: activeHouse?.color || "#00cec8" }}
          />
          <select
            value={activeHouseId}
            onChange={(e) => {
              if (e.target.value === "__NEW__") {
                onOpenCreateHouse();
              } else {
                setActiveHouseId(e.target.value);
                onNavigate("dashboard");
              }
            }}
            className="rounded-lg border border-transparent bg-transparent py-1 text-sm font-semibold text-[#29423e] outline-none hover:border-[#cfddda] focus:border-[#00aaa6]"
          >
            {houses.map((h) => (
              <option key={h.id} value={h.id}>
                Casa: {h.name}
              </option>
            ))}
            {isAdmin && <option value="__NEW__">+ Nueva casa...</option>}
          </select>
        </div>
      </div>

      {/* Perfil del Usuario y Rol inmutable */}
      <div className="relative flex items-center gap-3">
        {/* Badge de Rol fijo (Inmutable por diseño de seguridad) */}
        <div
          className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold ${
            isAdmin
              ? "border-[#fcd9cc] bg-[#fff5f0] text-[#c04b20]"
              : "border-[#c4ebe7] bg-[#eefaf9] text-[#00827d]"
          }`}
          title={`Rol asignado: ${role}`}
        >
          <Icon name={isAdmin ? "shield" : "user"} className="h-3.5 w-3.5" />
          <span>{role}</span>
        </div>

        {/* Botón de Perfil */}
        <button
          onClick={() => setShowProfileMenu(!showProfileMenu)}
          className="flex items-center gap-2 rounded-xl p-1.5 transition hover:bg-[#f1f6f5]"
          aria-label="Menú de usuario"
        >
          <div className="grid h-10 w-10 place-items-center rounded-full bg-[#e2f7f5] text-sm font-bold text-[#008a85] shadow-2xs">
            {user?.name?.slice(0, 2).toUpperCase() || "NX"}
          </div>
          <div className="hidden text-left md:block">
            <p className="text-xs font-bold leading-none text-[#233835]">{user?.name}</p>
            <p className="mt-1 text-[11px] leading-none text-[#738582]">{user?.email}</p>
          </div>
          <Icon name="chevron" className="hidden h-3.5 w-3.5 text-[#889996] md:block" />
        </button>

        {/* Menú Desplegable de Usuario (Solo información y cerrar sesión) */}
        {showProfileMenu && (
          <div className="absolute right-0 top-14 z-50 w-64 rounded-2xl border border-[#dce8e6] bg-white p-3 shadow-xl">
            <div className="px-3 pb-3 pt-1">
              <p className="text-xs font-bold text-[#233936]">{user?.name}</p>
              <p className="text-[11px] text-[#788a87]">{user?.email}</p>
              <p className="mt-1 text-[11px] text-[#556966]">{user?.businessName}</p>
              <div className="mt-2.5 inline-block rounded-md bg-[#edf7f6] px-2.5 py-1 text-[10px] font-bold text-[#008480]">
                Rol: {role}
              </div>
            </div>

            <div className="border-t border-[#edf3f2] pt-2">
              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  logout();
                }}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-bold text-[#b84824] hover:bg-[#fff0eb]"
              >
                <Icon name="logout" className="h-4 w-4" />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
