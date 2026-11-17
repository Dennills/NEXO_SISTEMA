import { useMemo } from "react";
import { useNexo } from "../../context/NexoContext";
import { computeAutoChartData, computePriorities } from "../../lib/engine";
import { Icon } from "../common/Icon";
import { AutoChartWidget } from "./AutoChartWidget";
import { PriorityWidget } from "./PriorityWidget";

export function DashboardView({
  onNavigate,
  onOpenCreateBlock,
}: {
  onNavigate: (route: string) => void;
  onOpenCreateBlock: () => void;
}) {
  const { activeHouse, houseBlocks, records, houseRelations } = useNexo();

  const houseRecords = useMemo(() => {
    const blockIds = new Set(houseBlocks.map((b) => b.id));
    return records.filter((r) => blockIds.has(r.blockId));
  }, [houseBlocks, records]);

  // Calcular prioridades y semáforos (Épica D)
  const priorities = useMemo(() => {
    return computePriorities(houseBlocks, houseRecords);
  }, [houseBlocks, houseRecords]);

  // Generar datos para el gráfico automático (Épica E)
  const chartInfo = useMemo(() => {
    return computeAutoChartData(houseBlocks, houseRecords);
  }, [houseBlocks, houseRecords]);

  return (
    <div className="space-y-8">
      {/* Encabezado */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="flex items-center gap-2">
            <span
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: activeHouse?.color || "#00cec8" }}
            />
            <p className="text-xs font-bold uppercase tracking-[.16em] text-[#009e9b]">
              Casa Activa
            </p>
          </div>
          <h1 className="title-font mt-1 text-[32px] font-semibold leading-tight tracking-[-.025em] text-[#1d3532] md:text-[38px]">
            {activeHouse?.name || "Panel de Gestión"}
          </h1>
          <p className="mt-1 max-w-2xl text-[15px] text-[#697a77]">
            {activeHouse?.description || "Monitoreo consolidado de bloques y métricas operativas."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => onNavigate("relations")}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#009e9b] px-5 text-sm font-bold text-white shadow-[0_5px_16px_rgba(0,158,155,.18)] transition hover:bg-[#008985]"
          >
            <span className="text-lg leading-none">⋈</span>
            <span>Relacionar bloques ({houseRelations.length})</span>
          </button>
        </div>
      </div>

      {/* Tarjetas de Acceso Rápido a Bloques */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {houseBlocks.map((block) => {
          const count = records.filter((r) => r.blockId === block.id).length;
          return (
            <button
              key={block.id}
              onClick={() => onNavigate(`block-${block.id}`)}
              className="group flex items-center justify-between rounded-[22px] border border-[#dbe7e5] bg-white p-5 text-left shadow-[0_5px_20px_rgba(30,61,56,.04)] transition hover:-translate-y-0.5 hover:border-[#67d1cd] hover:shadow-[0_10px_28px_rgba(30,61,56,.08)]"
            >
              <div className="flex items-center gap-4">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#ddf7f5] text-[#008c88]">
                  <Icon name={(block.icon as any) || "box"} className="h-6 w-6" />
                </span>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#82918e]">
                    Bloque de datos
                  </p>
                  <h3 className="title-font text-lg font-semibold text-[#1e3633]">
                    {block.name}
                  </h3>
                  <p className="mt-0.5 text-xs text-[#70817e]">{count} registros cargados</p>
                </div>
              </div>
              <Icon
                name="chevron"
                className="h-5 w-5 text-[#869693] transition group-hover:translate-x-1"
              />
            </button>
          );
        })}

        {/* Botón para agregar bloque */}
        <button
          onClick={onOpenCreateBlock}
          className="flex min-h-[96px] items-center justify-center gap-3 rounded-[22px] border-2 border-dashed border-[#ccdcd9] bg-transparent p-5 text-center font-bold text-[#35514e] transition hover:border-[#00aaa6] hover:bg-[#f3faf9]"
        >
          <Icon name="plus" className="h-5 w-5 text-[#009e9b]" />
          <span>Agregar nuevo bloque</span>
        </button>
      </div>

      {/* Grilla Principal: Gráfico Automático + Semáforo de Prioridades */}
      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <AutoChartWidget
          title={chartInfo.chartTitle}
          subtitle={chartInfo.chartSubtitle}
          totalDisplay={chartInfo.totalSumDisplay}
          data={chartInfo.data}
        />

        <PriorityWidget priorities={priorities} />
      </div>
    </div>
  );
}
