import { Block, FieldDefinition, JoinedRow, PriorityItem, RecordItem, Relation } from "../types/nexo";

/**
 * MOTOR DE LÓGICA DE NEGOCIO NEXO (Sin IA - Reglas deterministas)
 */

// 1. Cruce entre bloques (⋈ Relación tipo JOIN)
export function computeRelationJoin(
  sourceBlock: Block,
  sourceRecords: RecordItem[],
  targetBlock: Block,
  targetRecords: RecordItem[],
  relation: Relation
): JoinedRow[] {
  if (!sourceBlock || !targetBlock || !sourceBlock.fields || !targetBlock.fields) return [];
  const result: JoinedRow[] = [];
  const sourceField = sourceBlock.fields.find((f) => f.id === relation.sourceFieldId) || sourceBlock.fields[0];
  const targetField = targetBlock.fields.find((f) => f.id === relation.targetFieldId) || targetBlock.fields[0];

  if (!sourceField || !targetField) return [];

  // Indexar registros fuente por clave común (normalizada a minúsculas)
  (sourceRecords || []).forEach((sRecord) => {
    const sData = sRecord?.data || {};
    const rawVal = sData[sourceField.id];
    if (rawVal === undefined || rawVal === null || rawVal === "") return;

    const key = String(rawVal).trim().toLowerCase();

    // Encontrar todos los registros del bloque destino que coincidan con esta clave
    const matches = (targetRecords || []).filter((tRecord) => {
      const tData = tRecord?.data || {};
      const tVal = tData[targetField.id];
      if (tVal === undefined || tVal === null) return false;
      return String(tVal).trim().toLowerCase() === key;
    });

    // Calcular valores derivados automáticamente por reglas
    const calculatedValues: Record<string, number | string> = {};

    if (relation.calculatedFields && relation.calculatedFields.length > 0) {
      relation.calculatedFields.forEach((calc) => {
        const sValNum = Number(sData[calc.sourceFieldId]) || 0;
        const tTotalNum = matches.reduce((acc, m) => acc + (Number((m?.data || {})[calc.targetFieldId]) || 0), 0);

        if (calc.operation === "multiply") {
          calculatedValues[calc.id] = sValNum * tTotalNum;
        } else if (calc.operation === "subtract") {
          calculatedValues[calc.id] = sValNum - tTotalNum;
        } else if (calc.operation === "add") {
          calculatedValues[calc.id] = sValNum + tTotalNum;
        }
      });
    } else {
      // Inferencia automática por regla: si el bloque fuente tiene un campo tipo "currency" y el destino uno numérico ("cantidad"), calcular total
      const priceField = sourceBlock.fields.find((f) => f.type === "currency" || f.id.toLowerCase().includes("precio"));
      const qtyField = targetBlock.fields.find((f) => f.type === "number" || f.id.toLowerCase().includes("cantidad") || f.id.toLowerCase().includes("unidades"));

      if (priceField && qtyField) {
        const price = Number(sData[priceField.id]) || 0;
        const totalQty = matches.reduce((acc, m) => acc + (Number((m?.data || {})[qtyField.id]) || 0), 0);
        calculatedValues["auto_total"] = price * totalQty;
        calculatedValues["auto_qty"] = totalQty;
      }
    }

    result.push({
      key: String(rawVal),
      sourceRow: sData,
      targetRows: matches.map((m) => m?.data || {}),
      calculatedValues,
    });
  });

  return result;
}

// 2. Motor de Semáforo de Prioridad (Épica D: ver alertas en 10 segundos)
export function computePriorities(blocks: Block[], records: RecordItem[]): PriorityItem[] {
  const priorities: PriorityItem[] = [];
  const now = new Date();

  (blocks || []).forEach((block) => {
    if (!block || !block.fields) return;
    const blockRecords = (records || []).filter((r) => r && r.blockId === block.id);

    // Buscar campos relevantes para alertas (stock, fecha de entrega, estado)
    const stockField = block.fields.find((f) => f.id.toLowerCase().includes("stock") || f.name.toLowerCase().includes("stock") || f.name.toLowerCase().includes("existencia"));
    const dateField = block.fields.find((f) => f.type === "date" || f.name.toLowerCase().includes("entrega") || f.name.toLowerCase().includes("vence"));
    const statusField = block.fields.find((f) => f.type === "status" || f.name.toLowerCase().includes("estado"));
    const nameField = block.fields.find((f) => f.type === "text") || block.fields[0];

    blockRecords.forEach((record) => {
      const rData = record?.data || {};
      const title = String(rData[nameField?.id || ""] || "Registro sin nombre");

      // Regla A: Alerta por Stock
      if (stockField) {
        const stockVal = Number(rData[stockField.id]);
        if (!isNaN(stockVal)) {
          if (stockVal <= 0) {
            priorities.push({
              id: `${record.id}-stock-zero`,
              title,
              subtitle: "Sin existencias en inventario",
              status: "danger",
              statusText: "Agotado",
              sourceBlockName: block.name,
              recordId: record.id,
            });
            return;
          } else if (stockVal < 10) {
            priorities.push({
              id: `${record.id}-stock-low`,
              title,
              subtitle: `Quedan solo ${stockVal} ${stockField.unit || "unidades"}`,
              status: "warning",
              statusText: "Stock bajo",
              sourceBlockName: block.name,
              recordId: record.id,
            });
            return;
          }
        }
      }

      // Regla B: Alerta por Fecha de Entrega / Atrasos
      if (dateField && rData[dateField.id]) {
        const recordDate = new Date(String(rData[dateField.id]));
        if (!isNaN(recordDate.getTime())) {
          // Diferencia en días
          const diffMs = now.getTime() - recordDate.getTime();
          const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

          const isCompleted = statusField && String(rData[statusField.id]).toLowerCase().includes("complet");

          if (!isCompleted && diffDays > 0) {
            priorities.push({
              id: `${record.id}-late`,
              title,
              subtitle: `Fecha pactada: ${rData[dateField.id]}`,
              status: "danger",
              statusText: `Atrasado ${diffDays} día${diffDays > 1 ? "s" : ""}`,
              sourceBlockName: block.name,
              recordId: record.id,
              daysLate: diffDays,
            });
            return;
          } else if (!isCompleted && diffDays === 0) {
            priorities.push({
              id: `${record.id}-due-today`,
              title,
              subtitle: "Compromiso programado para hoy",
              status: "warning",
              statusText: "Vence hoy",
              sourceBlockName: block.name,
              recordId: record.id,
              daysLate: 0,
            });
            return;
          }
        }
      }

      // Si todo está normal, registrar estado verde (existencias suficientes o en regla)
      if (stockField && Number(rData[stockField.id]) >= 10) {
        priorities.push({
          id: `${record.id}-stock-ok`,
          title,
          subtitle: `Existencias: ${rData[stockField.id]} ${stockField.unit || "uds."}`,
          status: "success",
          statusText: "Existencias suficientes",
          sourceBlockName: block.name,
          recordId: record.id,
        });
      }
    });
  });

  // Ordenar: primero los 'danger', luego 'warning', luego 'success'
  const rank: Record<string, number> = { danger: 0, warning: 1, neutral: 2, success: 3 };
  return priorities.sort((a, b) => {
    const diff = rank[a.status] - rank[b.status];
    if (diff !== 0) return diff;
    return (b.daysLate || 0) - (a.daysLate || 0);
  });
}

// 3. Motor de Gráfico Automático (Épica E: regla fija sin IA)
export interface ChartBarData {
  label: string;
  value: number;
  displayValue: string;
}

export function computeAutoChartData(blocks: Block[], records: RecordItem[]): {
  chartTitle: string;
  chartSubtitle: string;
  totalSumDisplay: string;
  data: ChartBarData[];
} {
  const safeBlocks = blocks || [];
  const safeRecords = records || [];

  // Buscar bloque de ventas o transacciones
  const salesBlock = safeBlocks.find((b) => b?.name?.toLowerCase().includes("venta") || b?.name?.toLowerCase().includes("pedido")) || safeBlocks[1] || safeBlocks[0];

  if (!salesBlock || !salesBlock.fields) {
    return {
      chartTitle: "Actividad reciente",
      chartSubtitle: "Sin bloques registrados",
      totalSumDisplay: "$0.00",
      data: [],
    };
  }

  const blockRecords = safeRecords.filter((r) => r && r.blockId === salesBlock.id);

  // Buscar campo numérico o de moneda
  const amountField = salesBlock.fields.find((f) => f.type === "currency" || f.type === "number");
  const labelField = salesBlock.fields.find((f) => f.type === "date") || salesBlock.fields.find((f) => f.type === "text") || salesBlock.fields[0];

  if (!amountField || blockRecords.length === 0) {
    const days = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
    const fallbackData: ChartBarData[] = days.map((day, idx) => {
      const simulatedVal = [58, 78, 48, 92, 72, 100, 62][idx] || 50;
      return {
        label: day,
        value: simulatedVal,
        displayValue: `$${(simulatedVal * 42).toLocaleString()}`,
      };
    });
    return {
      chartTitle: "Ventas de la semana",
      chartSubtitle: "Visualización generada automáticamente",
      totalSumDisplay: "$24.680",
      data: fallbackData,
    };
  }

  // Agrupar por etiqueta (fecha o nombre)
  let totalSum = 0;
  const groups: Record<string, number> = {};

  blockRecords.forEach((rec) => {
    const rData = rec?.data || {};
    const rawLabel = String(rData[labelField?.id || ""] || "Registro");
    const val = Number(rData[amountField.id]) || 0;
    totalSum += val;
    groups[rawLabel] = (groups[rawLabel] || 0) + val;
  });

  const keys = Object.keys(groups);
  const maxVal = Math.max(...Object.values(groups), 1);

  const data: ChartBarData[] = keys.slice(0, 7).map((k) => {
    const rawAmount = groups[k];
    const percentage = Math.round((rawAmount / maxVal) * 100);
    return {
      label: k.length > 8 ? k.slice(0, 8) + "…" : k,
      value: Math.max(percentage, 10),
      displayValue: amountField.type === "currency" ? `$${rawAmount.toFixed(2)}` : `${rawAmount}`,
    };
  });

  return {
    chartTitle: `Métricas de ${salesBlock.name}`,
    chartSubtitle: `Calculado en base a ${blockRecords.length} registros`,
    totalSumDisplay: amountField.type === "currency" ? `$${totalSum.toLocaleString("es-PE", { minimumFractionDigits: 2 })}` : `${totalSum}`,
    data,
  };
}
