import { useMemo, useState } from "react";
import { PriorityItem } from "../../types/nexo";
import { Icon } from "../common/Icon";
import { StatusBadge } from "../common/Badge";

export function PriorityWidget({
  priorities,
  onSelectRecord,
}: {
  priorities: PriorityItem[];
  onSelectRecord?: (recordId: string) => void;
}) {
  const [onlyUrgent, setOnlyUrgent] = useState(false);

  const filtered = useMemo(() => {
    if (!onlyUrgent) return priorities;
    return priorities.filter((p) => p.status === "danger" || p.status === "warning");
  }, [priorities, onlyUrgent]);

  const dangerCount = priorities.filter((p) => p.status === "danger").length;

  return (
    <div className="rounded-[24px] border border-[#dce8e6] bg-white p-6 shadow-[0_7px_26px_rgba(30,61,56,.04)] md:p-7">
      {/* Encabezado y filtro de 1 clic */}
      <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="title-font text-xl font-semibold text-[#1e3633]">
              Semáforo de Prioridades
            </h3>
            {dangerCount > 0 && (
              <span className="rounded-full bg-[#fff0eb] px-2 py-0.5 text-xs font-bold text-[#b84824]">
                {dangerCount} urgente{dangerCount > 1 ? "s" : ""}
              </span>
            )}
          </div>
          <p className="mt-0.5 text-xs text-[#7c8d8a]">
            Responde qué necesita atención en menos de 10 segundos
          </p>
        </div>

        {/* Filtro rápido (Épica D: NEX-09) */}
        <button
          onClick={() => setOnlyUrgent(!onlyUrgent)}
          className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition ${
            onlyUrgent
              ? "bg-[#fff0eb] text-[#b84824] ring-2 ring-[#d85a30]"
              : "bg-[#f1f6f5] text-[#556965] hover:bg-[#e4eceb]"
          }`}
        >
          <Icon name="filter" className="h-3.5 w-3.5" />
          {onlyUrgent ? "Mostrando solo urgentes" : "Filtrar urgentes"}
        </button>
      </div>

      {/* Lista de alertas */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#d8e5e3] p-8 text-center text-sm text-[#798b88]">
          <span className="mb-2 block text-2xl">🎉</span>
          ¡Excelente! No hay atrasos ni existencias críticas pendientes.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.slice(0, 5).map((item) => {
            const bgMap = {
              danger: "bg-[#fff5f2] border-[#fcdacf]",
              warning: "bg-[#fffbf0] border-[#fae8b3]",
              success: "bg-[#f2faf6] border-[#caeedf]",
              neutral: "bg-[#f8faf9] border-[#e1e9e7]",
            };

            return (
              <div
                key={item.id}
                onClick={() => onSelectRecord && onSelectRecord(item.recordId)}
                className={`flex items-center justify-between gap-3 rounded-2xl border p-3.5 transition hover:shadow-xs cursor-pointer ${bgMap[item.status]}`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-bold text-[#2d423f]">{item.title}</p>
                      <span className="text-[10px] text-[#869693]">({item.sourceBlockName})</span>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-[#6e807c]">{item.subtitle}</p>
                  </div>
                </div>

                <StatusBadge status={item.status} label={item.statusText} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
