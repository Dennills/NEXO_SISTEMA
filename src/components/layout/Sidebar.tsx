import { useAuth } from "../../context/AuthContext";
import { useNexo } from "../../context/NexoContext";
import { Icon } from "../common/Icon";

export function Sidebar({
  currentRoute,
  onNavigate,
  onOpenCreateBlock,
}: {
  currentRoute: string;
  onNavigate: (route: string) => void;
  onOpenCreateBlock: () => void;
}) {
  const { isAdmin } = useAuth();
  const { houseBlocks, activeHouse } = useNexo();

  return (
    <aside className="fixed bottom-0 left-0 right-0 z-20 border-t border-[#dde8e6] bg-white md:top-[74px] md:right-auto md:w-[240px] md:border-r md:border-t-0 md:overflow-y-auto">
      <nav className="flex justify-around p-2 md:block md:p-5">
        {/* Navegación general */}
        <p className="mb-2 hidden px-3 text-[11px] font-bold uppercase tracking-[.16em] text-[#92a09e] md:block">
          Módulos
        </p>

        <button
          onClick={() => onNavigate("houses")}
          className={`flex min-w-[62px] flex-col items-center gap-1 rounded-xl px-2 py-2 text-[11px] font-semibold transition md:mb-1 md:w-full md:flex-row md:gap-3 md:px-3 md:py-2.5 md:text-sm ${
            currentRoute === "houses"
              ? "bg-[#e2f8f6] text-[#007b78]"
              : "text-[#667572] hover:bg-[#f3f7f6]"
          }`}
        >
          <Icon name="home" className="h-5 w-5" />
          <span>Mis Casas</span>
        </button>

        <button
          onClick={() => onNavigate("dashboard")}
          className={`flex min-w-[62px] flex-col items-center gap-1 rounded-xl px-2 py-2 text-[11px] font-semibold transition md:mb-1 md:w-full md:flex-row md:gap-3 md:px-3 md:py-2.5 md:text-sm ${
            currentRoute === "dashboard"
              ? "bg-[#e2f8f6] text-[#007b78]"
              : "text-[#667572] hover:bg-[#f3f7f6]"
          }`}
        >
          <Icon name="grid" className="h-5 w-5" />
          <span>Dashboard</span>
        </button>

        <button
          onClick={() => onNavigate("relations")}
          className={`flex min-w-[62px] flex-col items-center gap-1 rounded-xl px-2 py-2 text-[11px] font-semibold transition md:mb-1 md:w-full md:flex-row md:gap-3 md:px-3 md:py-2.5 md:text-sm ${
            currentRoute === "relations"
              ? "bg-[#e2f8f6] text-[#007b78]"
              : "text-[#667572] hover:bg-[#f3f7f6]"
          }`}
        >
          <span className="text-base font-bold">⋈</span>
          <span>Relaciones (⋈)</span>
        </button>

        {/* Bloques de la casa activa */}
        <div className="mt-5 hidden border-t border-[#edf2f1] pt-4 md:block">
          <div className="mb-2 flex items-center justify-between px-3">
            <p className="text-[11px] font-bold uppercase tracking-[.16em] text-[#92a09e]">
              Bloques de Datos
            </p>
            {isAdmin && (
              <button
                onClick={onOpenCreateBlock}
                className="grid h-5 w-5 place-items-center rounded-md text-[#008d89] hover:bg-[#e4f7f5]"
                title="Crear nuevo bloque"
              >
                <Icon name="plus" className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="space-y-1">
            {houseBlocks.map((block) => {
              const active = currentRoute === `block-${block.id}`;
              return (
                <button
                  key={block.id}
                  onClick={() => onNavigate(`block-${block.id}`)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-semibold transition ${
                    active ? "bg-[#e2f8f6] text-[#007b78]" : "text-[#667572] hover:bg-[#f3f7f6]"
                  }`}
                >
                  <Icon name={(block.icon as any) || "box"} className="h-4 w-4" />
                  <span className="truncate">{block.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Estado del Sistema */}
        <div className="mt-8 hidden rounded-2xl bg-[#f2f7f6] p-4 md:block">
          <div className="mb-1 flex items-center gap-2 text-xs font-bold text-[#445b58]">
            <span className="h-2 w-2 rounded-full bg-[#10b981]" />
            <span>Sistema Conectado</span>
          </div>
          <p className="text-[11px] leading-4 text-[#758784]">
            Casa actual: <strong>{activeHouse?.name}</strong>
          </p>
        </div>
      </nav>
    </aside>
  );
}
