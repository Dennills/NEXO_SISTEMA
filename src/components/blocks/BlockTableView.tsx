import { useMemo, useState } from "react";
import { Block, RecordItem } from "../../types/nexo";
import { useAuth } from "../../context/AuthContext";
import { useNexo } from "../../context/NexoContext";
import { Icon } from "../common/Icon";
import { StatusBadge } from "../common/Badge";
import { RecordFormModal } from "./RecordFormModal";

export function BlockTableView({
  block,
  onNavigate,
}: {
  block: Block;
  onNavigate: (route: string) => void;
}) {
  const { user, isAdmin } = useAuth();
  const { records, createRecord, updateRecord, deleteRecord, exportBlockToCSV } = useNexo();

  const [query, setQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<RecordItem | null>(null);

  const blockRecords = useMemo(() => {
    return records.filter((r) => r.blockId === block.id);
  }, [records, block.id]);

  const filtered = useMemo(() => {
    if (!query.trim()) return blockRecords;
    const q = query.toLowerCase();
    return blockRecords.filter((rec) => {
      return Object.values(rec.data).some((val) =>
        String(val).toLowerCase().includes(q)
      );
    });
  }, [blockRecords, query]);

  function handleSave(data: Record<string, any>) {
    if (editingRecord) {
      updateRecord(editingRecord.id, data);
      setEditingRecord(null);
    } else {
      createRecord(block.id, data, user?.name || "Operador");
    }
  }

  return (
    <div className="space-y-6">
      {/* Botón volver */}
      <button
        onClick={() => onNavigate("dashboard")}
        className="flex items-center gap-2 text-sm font-semibold text-[#657874] hover:text-[#1f3734]"
      >
        <span className="rotate-180">
          <Icon name="arrow" className="h-4 w-4" />
        </span>
        Volver al Dashboard
      </button>

      {/* Encabezado */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-[#e3f7f5] p-1 text-[#008d89]">
              <Icon name={(block.icon as any) || "box"} className="h-4 w-4" />
            </span>
            <p className="text-xs font-bold uppercase tracking-[.16em] text-[#009e9b]">
              Bloque de Datos
            </p>
          </div>
          <h1 className="title-font mt-1 text-[32px] font-semibold text-[#1e3633]">
            {block.name}
          </h1>
          <p className="mt-1 text-sm text-[#6f807d]">
            {block.description || "Registro y visualización estructurada de información."}
          </p>
        </div>

        {/* Acciones principales */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => exportBlockToCSV(block.id)}
            className="inline-flex h-11 items-center gap-2 rounded-xl border border-[#d6e2e0] bg-white px-4 text-sm font-bold text-[#4c5f5c] transition hover:bg-[#f6f9f8]"
            title="Exportar a archivo Excel / CSV"
          >
            <Icon name="download" className="h-4 w-4" />
            <span className="hidden sm:inline">Exportar CSV</span>
          </button>

          <button
            onClick={() => {
              setEditingRecord(null);
              setIsModalOpen(true);
            }}
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#009e9b] px-5 text-sm font-bold text-white shadow-[0_5px_16px_rgba(0,158,155,.2)] transition hover:bg-[#008985]"
          >
            <Icon name="plus" className="h-4 w-4" />
            <span>Nuevo Registro</span>
          </button>
        </div>
      </div>

      {/* Tabla y barra de búsqueda */}
      <section className="overflow-hidden rounded-[24px] border border-[#dce8e6] bg-white shadow-[0_7px_26px_rgba(30,61,56,.04)]">
        <div className="flex flex-col justify-between gap-4 border-b border-[#e5ecea] p-5 sm:flex-row sm:items-center md:px-7">
          <div className="relative w-full sm:max-w-[360px]">
            <Icon
              name="search"
              className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#879592]"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar en todos los campos..."
              className="h-11 w-full rounded-xl border border-[#d7e1df] bg-[#fafcfb] pl-11 pr-4 text-sm outline-none focus:border-[#00aaa6] focus:ring-3 focus:ring-[#00cec8]/10"
            />
          </div>
          <p className="text-sm text-[#7d8a88]">
            <strong className="text-[#3f5551]">{filtered.length}</strong> registros encontrados
          </p>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left">
            <thead className="bg-[#f7faf9] text-[11px] font-bold uppercase tracking-[.12em] text-[#7d8b88]">
              <tr>
                {block.fields.map((f, i) => (
                  <th
                    key={f.id}
                    className={`py-4 ${i === 0 ? "px-7" : "px-6"} ${
                      f.type === "currency" || f.type === "number" ? "text-right" : ""
                    }`}
                  >
                    {f.name}
                  </th>
                ))}
                <th className="px-6 py-4 text-center">Estado</th>
                <th className="px-7 py-4 text-right">Acciones</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#e9efed]">
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={block.fields.length + 2}
                    className="p-10 text-center text-sm text-[#7e8f8c]"
                  >
                    No se encontraron registros en este bloque. Haz clic en "Nuevo Registro" para agregar el primero.
                  </td>
                </tr>
              ) : (
                filtered.map((record) => {
                  return (
                    <tr key={record.id} className="transition hover:bg-[#fbfdfc]">
                      {block.fields.map((f, i) => {
                        const val = record.data[f.id];
                        let rendered: any = val ?? "—";

                        if (f.type === "currency" && val !== undefined) {
                          rendered = `$${Number(val).toFixed(2)}`;
                        } else if (f.type === "number" && val !== undefined && f.unit) {
                          rendered = `${val} ${f.unit}`;
                        }

                        return (
                          <td
                            key={f.id}
                            className={`py-4.5 text-sm ${i === 0 ? "px-7 font-bold text-[#2d4440]" : "px-6 text-[#516360]"} ${
                              f.type === "currency" || f.type === "number" ? "text-right font-semibold" : ""
                            }`}
                          >
                            {rendered}
                          </td>
                        );
                      })}

                      {/* Estado inteligente */}
                      <td className="px-6 py-4.5 text-center">
                        {renderStatusIndicator(block, record)}
                      </td>

                      {/* Acciones */}
                      <td className="px-7 py-4.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setEditingRecord(record);
                              setIsModalOpen(true);
                            }}
                            className="grid h-8 w-8 place-items-center rounded-lg text-[#617370] transition hover:bg-[#eef5f4] hover:text-[#008d89]"
                            title="Editar registro"
                          >
                            <Icon name="edit" className="h-4 w-4" />
                          </button>

                          {isAdmin && (
                            <button
                              onClick={() => {
                                if (window.confirm("¿Seguro que deseas eliminar este registro?")) {
                                  deleteRecord(record.id);
                                }
                              }}
                              className="grid h-8 w-8 place-items-center rounded-lg text-[#95a5a2] transition hover:bg-[#fff0eb] hover:text-[#b84824]"
                              title="Eliminar registro"
                            >
                              <Icon name="trash" className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Modal de formulario guiado */}
      {isModalOpen && (
        <RecordFormModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingRecord(null);
          }}
          block={block}
          onSave={handleSave}
          initialData={editingRecord?.data}
        />
      )}
    </div>
  );
}

// Semáforo automático por celda
function renderStatusIndicator(block: Block, record: RecordItem) {
  const stockField = block.fields.find((f) => f.id.toLowerCase().includes("stock"));
  if (stockField) {
    const s = Number(record.data[stockField.id]);
    if (s <= 0) return <StatusBadge status="danger" label="Agotado" />;
    if (s < 10) return <StatusBadge status="warning" label="Stock bajo" />;
    return <StatusBadge status="success" label="Disponible" />;
  }

  const statusField = block.fields.find((f) => f.type === "status");
  if (statusField && record.data[statusField.id]) {
    const val = String(record.data[statusField.id]).toLowerCase();
    if (val.includes("atrasad") || val.includes("urgente") || val.includes("cancel")) {
      return <StatusBadge status="danger" label={String(record.data[statusField.id])} />;
    }
    if (val.includes("pend")) {
      return <StatusBadge status="warning" label={String(record.data[statusField.id])} />;
    }
    return <StatusBadge status="success" label={String(record.data[statusField.id])} />;
  }

  return <span className="text-xs text-[#8a9b98]">—</span>;
}
