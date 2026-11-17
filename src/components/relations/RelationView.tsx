import { useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNexo } from "../../context/NexoContext";
import { computeRelationJoin } from "../../lib/engine";
import { Icon } from "../common/Icon";

export function RelationView({ onNavigate }: { onNavigate: (route: string) => void }) {
  const { isAdmin } = useAuth();
  const { houseBlocks, records, houseRelations, createRelation, deleteRelation } = useNexo();

  const [selectedSourceId, setSelectedSourceId] = useState<string>(() => houseBlocks[0]?.id || "");
  const [selectedTargetId, setSelectedTargetId] = useState<string>(() => houseBlocks[1]?.id || houseBlocks[0]?.id || "");
  const [selectedSourceKey, setSelectedSourceKey] = useState<string>("");
  const [selectedTargetKey, setSelectedTargetKey] = useState<string>("");
  const [successNotice, setSuccessNotice] = useState(false);

  const sourceBlock = houseBlocks.find((b) => b.id === selectedSourceId) || houseBlocks[0];
  const targetBlock = houseBlocks.find((b) => b.id === selectedTargetId) || houseBlocks[1] || houseBlocks[0];

  // Active relation
  const activeRelation = houseRelations[0];

  // Calcular el Join dinámico en vivo usando el motor
  const joinedRows = useMemo(() => {
    if (!sourceBlock || !targetBlock) return [];
    const sourceRecords = records.filter((r) => r.blockId === sourceBlock.id);
    const targetRecords = records.filter((r) => r.blockId === targetBlock.id);

    const relToUse = activeRelation || {
      id: "temp-rel",
      houseId: sourceBlock.houseId,
      name: "Cruce interactivo",
      sourceBlockId: sourceBlock.id,
      targetBlockId: targetBlock.id,
      sourceFieldId: selectedSourceKey || sourceBlock.fields[0]?.id,
      targetFieldId: selectedTargetKey || targetBlock.fields[0]?.id,
      createdAt: new Date().toISOString(),
    };

    return computeRelationJoin(sourceBlock, sourceRecords, targetBlock, targetRecords, relToUse);
  }, [sourceBlock, targetBlock, records, activeRelation, selectedSourceKey, selectedTargetKey]);

  function handleCreateRelation() {
    if (!sourceBlock || !targetBlock) return;
    const sKey = selectedSourceKey || sourceBlock.fields[0]?.id;
    const tKey = selectedTargetKey || targetBlock.fields[0]?.id;

    createRelation({
      houseId: sourceBlock.houseId,
      name: `${sourceBlock.name} ⋈ ${targetBlock.name}`,
      sourceBlockId: sourceBlock.id,
      targetBlockId: targetBlock.id,
      sourceFieldId: sKey,
      targetFieldId: tKey,
    });

    setSuccessNotice(true);
    setTimeout(() => setSuccessNotice(false), 3000);
  }

  return (
    <div className="space-y-8">
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
      <div>
        <p className="text-xs font-bold uppercase tracking-[.16em] text-[#009e9b]">
          Consulta Cruzada Automática (⋈)
        </p>
        <h1 className="title-font mt-1 text-[34px] font-semibold text-[#1e3633]">
          Relacionar Bloques
        </h1>
        <p className="mt-2 max-w-2xl text-[15px] leading-6 text-[#6a7d79]">
          Conecta dos bloques mediante una clave común (como el nombre del producto o cliente). El sistema cruza los datos y realiza cálculos automáticos sin fórmulas ni código.
        </p>
      </div>

      {/* Selector de Cruce (Solo configurable por ADMINISTRADOR) */}
      <section className="rounded-[26px] border border-[#dce8e6] bg-white p-6 shadow-[0_7px_26px_rgba(30,61,56,.04)] md:p-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="title-font text-xl font-semibold text-[#1f3835]">
            Configurador de Cruce ⋈
          </h2>
          {!isAdmin && (
            <span className="rounded-full bg-[#f1f6f5] px-3 py-1 text-xs font-semibold text-[#667a76]">
              Modo consulta (Operador)
            </span>
          )}
        </div>

        <div className="grid items-center gap-4 md:grid-cols-[1fr_60px_1fr]">
          {/* Bloque A */}
          <div className="rounded-2xl border border-[#e2ecea] bg-[#f8faf9] p-4">
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#768784]">
              Primer Bloque (Origen)
            </label>
            <select
              value={selectedSourceId}
              disabled={!isAdmin}
              onChange={(e) => setSelectedSourceId(e.target.value)}
              className="h-11 w-full rounded-xl border border-[#cfdedb] bg-white px-3 text-sm font-semibold outline-none focus:border-[#00aaa6]"
            >
              {houseBlocks.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
            <div className="mt-3">
              <label className="mb-1 block text-xs text-[#627572]">Campo clave de este bloque:</label>
              <select
                value={selectedSourceKey}
                disabled={!isAdmin}
                onChange={(e) => setSelectedSourceKey(e.target.value)}
                className="h-9 w-full rounded-lg border border-[#cfdedb] bg-white px-2.5 text-xs font-semibold outline-none"
              >
                {sourceBlock?.fields.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Símbolo ⋈ */}
          <div className="grid h-14 w-14 mx-auto place-items-center rounded-2xl bg-[#ddf7f5] text-2xl font-bold text-[#008d89] shadow-xs">
            ⋈
          </div>

          {/* Bloque B */}
          <div className="rounded-2xl border border-[#e2ecea] bg-[#f8faf9] p-4">
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#768784]">
              Segundo Bloque (Destino)
            </label>
            <select
              value={selectedTargetId}
              disabled={!isAdmin}
              onChange={(e) => setSelectedTargetId(e.target.value)}
              className="h-11 w-full rounded-xl border border-[#cfdedb] bg-white px-3 text-sm font-semibold outline-none focus:border-[#00aaa6]"
            >
              {houseBlocks.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
            <div className="mt-3">
              <label className="mb-1 block text-xs text-[#627572]">Campo clave coincidente:</label>
              <select
                value={selectedTargetKey}
                disabled={!isAdmin}
                onChange={(e) => setSelectedTargetKey(e.target.value)}
                className="h-9 w-full rounded-lg border border-[#cfdedb] bg-white px-2.5 text-xs font-semibold outline-none"
              >
                {targetBlock?.fields.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {isAdmin && (
          <div className="mt-6 flex items-center justify-between border-t border-[#edf3f2] pt-4">
            {successNotice ? (
              <span className="text-xs font-bold text-[#147a56]">
                ✓ Relación guardada correctamente
              </span>
            ) : (
              <span className="text-xs text-[#798b88]">
                Al relacionar, Nexo calculará automáticamente los totales combinados.
              </span>
            )}

            <button
              onClick={handleCreateRelation}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#009e9b] px-6 text-sm font-bold text-white shadow-[0_5px_16px_rgba(0,158,155,.2)] transition hover:bg-[#008985]"
            >
              <span className="text-lg">⋈</span>
              <span>Guardar Relación</span>
            </button>
          </div>
        )}
      </section>

      {/* Vista Previa Combinada */}
      <section className="overflow-hidden rounded-[26px] border border-[#dce8e6] bg-white shadow-[0_7px_26px_rgba(30,61,56,.04)]">
        <div className="flex flex-col justify-between gap-3 border-b border-[#e5ecea] p-5 sm:flex-row sm:items-center md:px-7">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="title-font text-xl font-semibold text-[#1e3633]">
                Resultado de la Consulta Combinada
              </h2>
              <span className="rounded-full bg-[#e2f8f5] px-2.5 py-0.5 text-[11px] font-bold text-[#008480]">
                Cálculo Automático
              </span>
            </div>
            <p className="mt-0.5 text-xs text-[#7d8f8c]">
              {sourceBlock?.name} ⋈ {targetBlock?.name}
            </p>
          </div>
          <span className="text-xs font-semibold text-[#71827f]">
            {joinedRows.length} coincidencias encontradas
          </span>
        </div>

        {/* Tabla combinada */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[750px] text-left">
            <thead className="bg-[#f7faf9] text-[11px] font-bold uppercase tracking-wider text-[#798b88]">
              <tr>
                <th className="px-7 py-4">Clave Común</th>
                <th className="px-6 py-4">Datos Origen</th>
                <th className="px-6 py-4 text-center">Registros Destino</th>
                <th className="px-7 py-4 text-right">Total Calculado (⋈)</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#e9efed]">
              {joinedRows.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-sm text-[#7d8f8c]">
                    No se encontraron coincidencias exactas entre ambos bloques para los campos seleccionados.
                  </td>
                </tr>
              ) : (
                joinedRows.map((row, idx) => {
                  const autoTotal = row.calculatedValues["auto_total"];
                  const autoQty = row.calculatedValues["auto_qty"];

                  return (
                    <tr key={`${row.key}-${idx}`} className="transition hover:bg-[#fafdfc]">
                      <td className="px-7 py-4 font-bold text-[#2d4440] text-sm">
                        {row.key}
                      </td>

                      <td className="px-6 py-4 text-xs text-[#526461]">
                        {Object.entries(row.sourceRow)
                          .slice(1, 3)
                          .map(([k, v]) => `${k}: ${v}`)
                          .join(" · ")}
                      </td>

                      <td className="px-6 py-4 text-center">
                        <span className="rounded-full bg-[#f1f6f5] px-2.5 py-1 text-xs font-bold text-[#445855]">
                          {row.targetRows.length} registro{row.targetRows.length !== 1 ? "s" : ""}
                          {autoQty !== undefined ? ` (${autoQty} uds.)` : ""}
                        </span>
                      </td>

                      <td className="px-7 py-4 text-right font-bold text-[#008d89] text-base">
                        {autoTotal !== undefined ? `$${Number(autoTotal).toFixed(2)}` : "—"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
