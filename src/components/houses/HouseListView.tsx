import { useAuth } from "../../context/AuthContext";
import { useNexo } from "../../context/NexoContext";
import { Icon } from "../common/Icon";

export function HouseListView({
  onNavigate,
  onOpenCreateHouse,
}: {
  onNavigate: (route: string) => void;
  onOpenCreateHouse: () => void;
}) {
  const { isAdmin } = useAuth();
  const { houses, blocks, setActiveHouseId, deleteHouse } = useNexo();

  return (
    <div className="space-y-8">
      {/* Encabezado */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="title-font text-[34px] font-semibold tracking-[-.025em] text-[#1e3633] md:text-[42px]">
            Mis Casas
          </h1>
          <p className="mt-2 max-w-2xl text-[15px] leading-6 text-[#697b78]">
            Cada casa es un contenedor temático que agrupa los procesos de tu negocio: producción, almacén, pedidos o logística.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={onOpenCreateHouse}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#009e9b] px-5 text-sm font-bold text-white shadow-[0_5px_16px_rgba(0,158,155,.2)] transition hover:bg-[#008985]"
          >
            <Icon name="plus" className="h-4 w-4" />
            <span>Nueva Casa</span>
          </button>
        )}
      </div>

      {/* Grid de Casas */}
      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {houses.map((house) => {
          const houseBlockCount = blocks.filter((b) => b.houseId === house.id).length;

          return (
            <div
              key={house.id}
              className="group relative flex flex-col justify-between overflow-hidden rounded-[26px] border border-[#dbe7e5] bg-white shadow-[0_8px_30px_rgba(31,61,57,.05)] transition hover:-translate-y-1 hover:shadow-[0_14px_38px_rgba(31,61,57,.09)]"
            >
              {/* Barra de color superior */}
              <div className="h-2.5 w-full" style={{ backgroundColor: house.color || "#00cec8" }} />

              <div className="p-6 md:p-7 flex-1 flex flex-col justify-between">
                <div>
                  <div className="mb-5 flex items-start justify-between">
                    <span
                      className="grid h-12 w-12 place-items-center rounded-2xl text-xl font-bold"
                      style={{
                        backgroundColor: `${house.color || "#00cec8"}20`,
                        color: house.color || "#00cec8",
                      }}
                    >
                      <Icon name="home" className="h-6 w-6" />
                    </span>
                    <span className="rounded-full bg-[#edf7f5] px-3 py-1 text-xs font-bold text-[#1f736e]">
                      {houseBlockCount} {houseBlockCount === 1 ? "bloque" : "bloques"}
                    </span>
                  </div>

                  <h2 className="title-font text-2xl font-semibold text-[#1e3835]">
                    {house.name}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-[#6d7e7b]">
                    {house.description || "Área de gestión operativa."}
                  </p>
                </div>

                <div className="mt-8 pt-4 border-t border-[#edf3f2] flex items-center justify-between">
                  <button
                    onClick={() => {
                      setActiveHouseId(house.id);
                      onNavigate("dashboard");
                    }}
                    className="flex items-center gap-2 text-sm font-bold text-[#008d89] hover:text-[#006e6a]"
                  >
                    Abrir casa
                    <Icon name="arrow" className="h-4 w-4 transition group-hover:translate-x-1" />
                  </button>

                  {isAdmin && houses.length > 1 && (
                    <button
                      onClick={() => {
                        if (window.confirm(`¿Seguro que deseas eliminar la casa "${house.name}"?`)) {
                          deleteHouse(house.id);
                        }
                      }}
                      className="text-xs font-semibold text-[#a8b8b5] hover:text-[#b84824]"
                      title="Eliminar casa"
                    >
                      Eliminar
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Tarjeta "+ Crear otra casa" */}
        {isAdmin && (
          <button
            onClick={onOpenCreateHouse}
            className="flex min-h-[300px] flex-col items-center justify-center rounded-[26px] border-2 border-dashed border-[#cbdad7] bg-transparent p-8 text-center transition hover:border-[#00b7b1] hover:bg-[#f3fbfa]"
          >
            <span className="mb-4 grid h-12 w-12 place-items-center rounded-full bg-white text-[#009e9b] shadow-sm">
              <Icon name="plus" className="h-6 w-6" />
            </span>
            <span className="title-font text-xl font-semibold text-[#324f4c]">
              Crear otra casa
            </span>
            <span className="mt-2 max-w-[240px] text-sm leading-6 text-[#758683]">
              Organiza una nueva parte de tu negocio con sus propios bloques.
            </span>
          </button>
        )}
      </section>
    </div>
  );
}
