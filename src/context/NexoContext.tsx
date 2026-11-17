import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { Block, FieldDefinition, House, RecordItem, Relation } from "../types/nexo";
import { storageService } from "../lib/storage";

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

  // Guardar cambios automáticamente
  useEffect(() => { storageService.saveHouses(houses); }, [houses]);
  useEffect(() => { storageService.saveBlocks(blocks); }, [blocks]);
  useEffect(() => { storageService.saveRecords(records); }, [records]);
  useEffect(() => { storageService.saveRelations(relations); }, [relations]);

  const activeHouse = houses.find((h) => h.id === activeHouseId) || houses[0];
  const houseBlocks = blocks.filter((b) => b.houseId === activeHouseId);
  const houseRelations = relations.filter((r) => r.houseId === activeHouseId);

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
    return newHouse;
  }

  function deleteHouse(houseId: string) {
    setHouses((prev) => prev.filter((h) => h.id !== houseId));
    setBlocks((prev) => prev.filter((b) => b.houseId !== houseId));
    setRecords((prev) => prev.filter((r) => r.houseId !== houseId));
    setRelations((prev) => prev.filter((rel) => rel.houseId !== houseId));
    if (activeHouseId === houseId) {
      const remaining = houses.filter((h) => h.id !== houseId);
      if (remaining.length > 0) setActiveHouseId(remaining[0].id);
    }
  }

  function createBlock(name: string, description: string, icon: Block["icon"], fields: FieldDefinition[]): Block {
    const newBlock: Block = {
      id: `block-${Date.now()}`,
      houseId: activeHouseId,
      name: name.trim(),
      description: description.trim(),
      icon: icon || "box",
      fields: fields.length > 0 ? fields : [
        { id: "nombre", name: "Nombre", type: "text", required: true },
        { id: "cantidad", name: "Cantidad", type: "number", required: true },
      ],
      createdAt: new Date().toISOString(),
    };
    setBlocks((prev) => [...prev, newBlock]);
    return newBlock;
  }

  function deleteBlock(blockId: string) {
    setBlocks((prev) => prev.filter((b) => b.id !== blockId));
    setRecords((prev) => prev.filter((r) => r.blockId !== blockId));
    setRelations((prev) => prev.filter((rel) => rel.sourceBlockId !== blockId && rel.targetBlockId !== blockId));
  }

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
  }

  function updateRecord(recordId: string, data: Record<string, any>) {
    setRecords((prev) =>
      prev.map((rec) =>
        rec.id === recordId
          ? { ...rec, data: { ...rec.data, ...data }, updatedAt: new Date().toISOString() }
          : rec
      )
    );
  }

  function deleteRecord(recordId: string) {
    setRecords((prev) => prev.filter((r) => r.id !== recordId));
  }

  function createRelation(relationData: Omit<Relation, "id" | "createdAt">): Relation {
    const newRelation: Relation = {
      ...relationData,
      id: `rel-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setRelations((prev) => [...prev, newRelation]);
    return newRelation;
  }

  function deleteRelation(id: string) {
    setRelations((prev) => prev.filter((r) => r.id !== id));
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
