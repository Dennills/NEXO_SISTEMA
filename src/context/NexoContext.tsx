import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { Block, FieldDefinition, House, RecordItem, Relation } from "../types/nexo";
import { storageService } from "../lib/storage";
import { isSupabaseConfigured, syncWithSupabase } from "../lib/supabase";

interface NexoContextType {
  houses: House[];
  activeHouseId: string;
  activeHouse: House | undefined;
  setActiveHouseId: (id: string) => void;
  createHouse: (name: string, description: string, color: string) => House;
  deleteHouse: (id: string) => void;

  blocks: Block[];
  houseBlocks: Block[];
  createBlock: (name: string, description: string, icon: Block["icon"], fields: FieldDefinition[]) => Block;
  deleteBlock: (id: string) => void;

  records: RecordItem[];
  createRecord: (blockId: string, data: Record<string, any>, author: string) => void;
  updateRecord: (recordId: string, data: Record<string, any>) => void;
  deleteRecord: (recordId: string) => void;

  relations: Relation[];
  houseRelations: Relation[];
  createRelation: (relation: Omit<Relation, "id" | "createdAt">) => Relation;
  deleteRelation: (id: string) => void;

  exportBlockToCSV: (blockId: string) => void;
  resetToDemoData: () => void;
}

const NexoContext = createContext<NexoContextType | undefined>(undefined);

export function NexoProvider({ children }: { children: ReactNode }) {
  const [houses, setHouses] = useState<House[]>(storageService.getHouses);
  const [activeHouseId, setActiveHouseId] = useState<string>(() => {
    return houses[0]?.id || "house-almacen-ventas";
  });
  const [blocks, setBlocks] = useState<Block[]>(storageService.getBlocks);
  const [records, setRecords] = useState<RecordItem[]>(storageService.getRecords);
  const [relations, setRelations] = useState<Relation[]>(storageService.getRelations);

  // 1. Cargar datos remotos desde Supabase al iniciar si está conectado
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    async function loadRemoteData() {
      try {
        const remoteHouses = await syncWithSupabase<any[]>("casas", "select");
        if (remoteHouses && remoteHouses.length > 0) {
          const mapped = remoteHouses.map((h) => ({
            id: h.id,
            name: h.nombre,
            description: h.descripcion || "",
            color: h.color || "#00cec8",
            icon: h.icon || "home",
            createdAt: h.created_at || new Date().toISOString(),
          }));
          setHouses(mapped);
          storageService.saveHouses(mapped);
        }

        const remoteBlocks = await syncWithSupabase<any[]>("bloques", "select");
        if (remoteBlocks && remoteBlocks.length > 0) {
          const mapped = remoteBlocks.map((b) => ({
            id: b.id,
            houseId: b.casa_id,
            name: b.nombre,
            description: b.descripcion || "",
            icon: b.icono || "box",
            fields: b.campos || [],
            createdAt: b.created_at || new Date().toISOString(),
          }));
          setBlocks(mapped);
          storageService.saveBlocks(mapped);
        }

        const remoteRecords = await syncWithSupabase<any[]>("registros", "select");
        if (remoteRecords && remoteRecords.length > 0) {
          const mapped = remoteRecords.map((r) => ({
            id: r.id,
            blockId: r.bloque_id,
            houseId: r.casa_id,
            data: r.datos || {},
            createdBy: r.creado_por || "Operador",
            createdAt: r.created_at || new Date().toISOString(),
            updatedAt: r.updated_at || new Date().toISOString(),
          }));
          setRecords(mapped);
          storageService.saveRecords(mapped);
        }

        const remoteRelations = await syncWithSupabase<any[]>("relaciones", "select");
        if (remoteRelations && remoteRelations.length > 0) {
          const mapped = remoteRelations.map((rel) => ({
            id: rel.id,
            houseId: rel.casa_id,
            name: rel.nombre,
            sourceBlockId: rel.source_block_id,
            targetBlockId: rel.target_block_id,
            sourceFieldId: rel.source_field_id,
            targetFieldId: rel.target_field_id,
            calculatedFields: rel.calculated_fields || [],
            createdAt: rel.created_at || new Date().toISOString(),
          }));
          setRelations(mapped);
          storageService.saveRelations(mapped);
        }
      } catch (err) {
        console.warn("Conexión con Supabase no disponible, usando almacenamiento local.");
      }
    }

    loadRemoteData();
  }, []);

  // Guardar en almacenamiento local como respaldo permanente
  useEffect(() => { storageService.saveHouses(houses); }, [houses]);
  useEffect(() => { storageService.saveBlocks(blocks); }, [blocks]);
  useEffect(() => { storageService.saveRecords(records); }, [records]);
  useEffect(() => { storageService.saveRelations(relations); }, [relations]);

  const activeHouse = houses.find((h) => h.id === activeHouseId) || houses[0];
  const houseBlocks = blocks.filter((b) => b.houseId === activeHouseId);
  const houseRelations = relations.filter((r) => r.houseId === activeHouseId);

  // CREAR CASA -> Guarda en Supabase y en Local
  function createHouse(name: string, description: string, color: string): House {
    const newHouse: House = {
      id: `house-${Date.now()}`,
      name: name.trim(),
      description: description.trim() || "Proceso de negocio personalizado",
      color: color || "#00cec8",
      icon: "home",
      createdAt: new Date().toISOString(),
    };
    setHouses((prev) => [newHouse, ...prev]);
    setActiveHouseId(newHouse.id);

    if (isSupabaseConfigured) {
      syncWithSupabase("casas", "insert", {
        id: newHouse.id,
        nombre: newHouse.name,
        descripcion: newHouse.description,
        color: newHouse.color,
        icon: newHouse.icon,
      });
    }

    return newHouse;
  }

  // ELIMINAR CASA -> Elimina en Supabase y en Local
  function deleteHouse(houseId: string) {
    setHouses((prev) => prev.filter((h) => h.id !== houseId));
    setBlocks((prev) => prev.filter((b) => b.houseId !== houseId));
    setRecords((prev) => prev.filter((r) => r.houseId !== houseId));
    setRelations((prev) => prev.filter((rel) => rel.houseId !== houseId));
    if (activeHouseId === houseId) {
      const remaining = houses.filter((h) => h.id !== houseId);
      if (remaining.length > 0) setActiveHouseId(remaining[0].id);
    }

    if (isSupabaseConfigured) {
      syncWithSupabase("casas", "delete", { id: houseId });
    }
  }

  // CREAR BLOQUE -> Guarda en Supabase y en Local
  function createBlock(name: string, description: string, icon: Block["icon"], fields: FieldDefinition[]): Block {
    const newBlock: Block = {
      id: `block-${Date.now()}`,
      houseId: activeHouseId,
      name: name.trim(),
      description: description.trim(),
      icon: icon || "box",
      fields: fields.length > 0 ? fields : [
        { id: "nombre", name: "Nombre", type: "text", required: true },
        { id: "cantidad", name: "Cantidad", type: "number", required: true, unit: "uds." },
      ],
      createdAt: new Date().toISOString(),
    };
    setBlocks((prev) => [...prev, newBlock]);

    if (isSupabaseConfigured) {
      syncWithSupabase("bloques", "insert", {
        id: newBlock.id,
        casa_id: newBlock.houseId,
        nombre: newBlock.name,
        descripcion: newBlock.description,
        icono: newBlock.icon,
        campos: newBlock.fields,
      });
    }

    return newBlock;
  }

  // ELIMINAR BLOQUE -> Elimina en Supabase y en Local
  function deleteBlock(blockId: string) {
    setBlocks((prev) => prev.filter((b) => b.id !== blockId));
    setRecords((prev) => prev.filter((r) => r.blockId !== blockId));
    setRelations((prev) => prev.filter((rel) => rel.sourceBlockId !== blockId && rel.targetBlockId !== blockId));

    if (isSupabaseConfigured) {
      syncWithSupabase("bloques", "delete", { id: blockId });
    }
  }

  // CREAR REGISTRO -> Guarda en Supabase y en Local
  function createRecord(blockId: string, data: Record<string, any>, author: string) {
    const newRecord: RecordItem = {
      id: `rec-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      blockId,
      houseId: activeHouseId,
      data,
      createdBy: author,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setRecords((prev) => [newRecord, ...prev]);

    if (isSupabaseConfigured) {
      syncWithSupabase("registros", "insert", {
        id: newRecord.id,
        bloque_id: newRecord.blockId,
        casa_id: newRecord.houseId,
        datos: newRecord.data,
        creado_por: newRecord.createdBy,
      });
    }
  }

  // EDITAR REGISTRO -> Actualiza en Supabase y en Local
  function updateRecord(recordId: string, data: Record<string, any>) {
    let updatedPayload: any = null;
    setRecords((prev) =>
      prev.map((rec) => {
        if (rec.id === recordId) {
          const merged = { ...rec.data, ...data };
          updatedPayload = merged;
          return { ...rec, data: merged, updatedAt: new Date().toISOString() };
        }
        return rec;
      })
    );

    if (isSupabaseConfigured && updatedPayload) {
      syncWithSupabase("registros", "update", {
        id: recordId,
        datos: updatedPayload,
      });
    }
  }

  // ELIMINAR REGISTRO -> Elimina en Supabase y en Local
  function deleteRecord(recordId: string) {
    setRecords((prev) => prev.filter((r) => r.id !== recordId));

    if (isSupabaseConfigured) {
      syncWithSupabase("registros", "delete", { id: recordId });
    }
  }

  // CREAR RELACIÓN (⋈) -> Guarda en Supabase y en Local
  function createRelation(relationData: Omit<Relation, "id" | "createdAt">): Relation {
    const newRelation: Relation = {
      ...relationData,
      id: `rel-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setRelations((prev) => [...prev, newRelation]);

    if (isSupabaseConfigured) {
      syncWithSupabase("relaciones", "insert", {
        id: newRelation.id,
        casa_id: newRelation.houseId,
        nombre: newRelation.name,
        source_block_id: newRelation.sourceBlockId,
        target_block_id: newRelation.targetBlockId,
        source_field_id: newRelation.sourceFieldId,
        target_field_id: newRelation.targetFieldId,
        calculated_fields: newRelation.calculatedFields,
      });
    }

    return newRelation;
  }

  // ELIMINAR RELACIÓN -> Elimina en Supabase y en Local
  function deleteRelation(id: string) {
    setRelations((prev) => prev.filter((r) => r.id !== id));

    if (isSupabaseConfigured) {
      syncWithSupabase("relaciones", "delete", { id });
    }
  }

  function exportBlockToCSV(blockId: string) {
    const block = blocks.find((b) => b.id === blockId);
    if (!block) return;
    const blockRecords = records.filter((r) => r.blockId === blockId);

    const headers = block.fields.map((f) => `"${f.name}"`).join(",");
    const rows = blockRecords.map((r) => {
      return block.fields
        .map((f) => {
          const val = r.data[f.id] !== undefined ? String(r.data[f.id]) : "";
          return `"${val.replace(/"/g, '""')}"`;
        })
        .join(",");
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Nexo_${block.name.replace(/\s+/g, "_")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function resetToDemoData() {
    localStorage.clear();
    setHouses(storageService.getHouses());
    setBlocks(storageService.getBlocks());
    setRecords(storageService.getRecords());
    setRelations(storageService.getRelations());
    setActiveHouseId("house-almacen-ventas");
  }

  return (
    <NexoContext.Provider
      value={{
        houses,
        activeHouseId,
        activeHouse,
        setActiveHouseId,
        createHouse,
        deleteHouse,
        blocks,
        houseBlocks,
        createBlock,
        deleteBlock,
        records,
        createRecord,
        updateRecord,
        deleteRecord,
        relations,
        houseRelations,
        createRelation,
        deleteRelation,
        exportBlockToCSV,
        resetToDemoData,
      }}
    >
      {children}
    </NexoContext.Provider>
  );
}

export function useNexo() {
  const ctx = useContext(NexoContext);
  if (!ctx) throw new Error("useNexo debe usarse dentro de NexoProvider");
  return ctx;
}
