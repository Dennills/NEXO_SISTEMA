import { Block, House, RecordItem, Relation, UserProfile } from "../types/nexo";
import { isSupabaseConfigured, syncWithSupabase } from "./supabase";

const STORAGE_KEYS = {
  HOUSES: "nexo_houses_v2",
  BLOCKS: "nexo_blocks_v2",
  RECORDS: "nexo_records_v2",
  RELATIONS: "nexo_relations_v2",
  USER: "nexo_user_v2",
};

// Semilla de datos iniciales basada en el documento de especificación de NEXO:
export const initialHouse: House = {
  id: "house-almacen-ventas",
  name: "Almacén y ventas",
  description: "Controla existencias, productos y ventas diarias de tu taller.",
  color: "#00cec8",
  icon: "bag",
  createdAt: "2026-11-01T10:00:00Z",
};

export const initialBlocks: Block[] = [
  {
    id: "block-productos",
    houseId: "house-almacen-ventas",
    name: "Productos",
    description: "Catálogo de existencias y precios unitarios",
    icon: "box",
    fields: [
      { id: "nombre", name: "Nombre del producto", type: "text", required: true },
      { id: "precio", name: "Precio unitario", type: "currency", required: true, unit: "$" },
      { id: "stock", name: "Stock disponible", type: "number", required: true, unit: "uds." },
      { id: "categoria", name: "Categoría", type: "category", required: false, options: ["Insumos", "Textil", "Accesorios"] },
    ],
    createdAt: "2026-11-01T10:05:00Z",
  },
  {
    id: "block-ventas",
    houseId: "house-almacen-ventas",
    name: "Ventas diarias",
    description: "Registro periódico de salidas y ventas",
    icon: "grid",
    fields: [
      { id: "producto", name: "Producto vendido", type: "text", required: true },
      { id: "cantidad", name: "Unidades vendidas", type: "number", required: true, unit: "uds." },
      { id: "fecha", name: "Fecha de venta", type: "date", required: true },
      { id: "cliente", name: "Cliente", type: "text", required: false },
    ],
    createdAt: "2026-11-01T10:10:00Z",
  },
  {
    id: "block-pedidos",
    houseId: "house-almacen-ventas",
    name: "Pedidos a proveedores",
    description: "Seguimiento a compromisos de entrega e hilos",
    icon: "truck",
    fields: [
      { id: "proveedor", name: "Proveedor", type: "text", required: true },
      { id: "material", name: "Material / Insumo", type: "text", required: true },
      { id: "fecha_entrega", name: "Fecha comprometida", type: "date", required: true },
      { id: "estado", name: "Estado del pedido", type: "status", required: true, options: ["Pendiente", "Atrasado", "Completado"] },
    ],
    createdAt: "2026-11-02T11:00:00Z",
  },
];

export const initialRecords: RecordItem[] = [
  // Productos en inventario
  {
    id: "rec-p1",
    blockId: "block-productos",
    houseId: "house-almacen-ventas",
    data: { nombre: "Tela azul marino", precio: 18.5, stock: 42, categoria: "Textil" },
    createdBy: "Marta Gómez",
    createdAt: "2026-11-10T12:00:00Z",
    updatedAt: "2026-11-10T12:00:00Z",
  },
  {
    id: "rec-p2",
    blockId: "block-productos",
    houseId: "house-almacen-ventas",
    data: { nombre: "Hilo blanco", precio: 3.75, stock: 8, categoria: "Insumos" }, // Alerta de stock bajo
    createdBy: "Marta Gómez",
    createdAt: "2026-11-10T12:05:00Z",
    updatedAt: "2026-11-10T12:05:00Z",
  },
  {
    id: "rec-p3",
    blockId: "block-productos",
    houseId: "house-almacen-ventas",
    data: { nombre: "Botones de nácar", precio: 6.2, stock: 0, categoria: "Accesorios" }, // Alerta de agotado
    createdBy: "Marta Gómez",
    createdAt: "2026-11-10T12:10:00Z",
    updatedAt: "2026-11-10T12:10:00Z",
  },
  {
    id: "rec-p4",
    blockId: "block-productos",
    houseId: "house-almacen-ventas",
    data: { nombre: "Cremallera beige", precio: 4.8, stock: 15, categoria: "Accesorios" },
    createdBy: "Marta Gómez",
    createdAt: "2026-11-10T12:15:00Z",
    updatedAt: "2026-11-10T12:15:00Z",
  },
  {
    id: "rec-p5",
    blockId: "block-productos",
    houseId: "house-almacen-ventas",
    data: { nombre: "Cinta de algodón", precio: 7.25, stock: 27, categoria: "Insumos" },
    createdBy: "Marta Gómez",
    createdAt: "2026-11-10T12:20:00Z",
    updatedAt: "2026-11-10T12:20:00Z",
  },

  // Ventas diarias (para el cruce ⋈)
  {
    id: "rec-v1",
    blockId: "block-ventas",
    houseId: "house-almacen-ventas",
    data: { producto: "Tela azul marino", cantidad: 18, fecha: "2026-11-16", cliente: "Taller San Pedro" },
    createdBy: "Carlos Rojas",
    createdAt: "2026-11-16T14:00:00Z",
    updatedAt: "2026-11-16T14:00:00Z",
  },
  {
    id: "rec-v2",
    blockId: "block-ventas",
    houseId: "house-almacen-ventas",
    data: { producto: "Hilo blanco", cantidad: 31, fecha: "2026-11-16", cliente: "Confecciones Lima" },
    createdBy: "Carlos Rojas",
    createdAt: "2026-11-16T15:30:00Z",
    updatedAt: "2026-11-16T15:30:00Z",
  },
  {
    id: "rec-v3",
    blockId: "block-ventas",
    houseId: "house-almacen-ventas",
    data: { producto: "Botones de nácar", cantidad: 24, fecha: "2026-11-15", cliente: "Diseños Camila" },
    createdBy: "Carlos Rojas",
    createdAt: "2026-11-15T10:00:00Z",
    updatedAt: "2026-11-15T10:00:00Z",
  },
  {
    id: "rec-v4",
    blockId: "block-ventas",
    houseId: "house-almacen-ventas",
    data: { producto: "Cremallera beige", cantidad: 12, fecha: "2026-11-15", cliente: "Artesanías Andinas" },
    createdBy: "Carlos Rojas",
    createdAt: "2026-11-15T11:45:00Z",
    updatedAt: "2026-11-15T11:45:00Z",
  },

  // Pedidos de proveedores (con caso de Rosa: pedidos de hilo atrasados)
  {
    id: "rec-ped1",
    blockId: "block-pedidos",
    houseId: "house-almacen-ventas",
    data: { proveedor: "Hilandería Norte", material: "Hilaza de algodón 40/1", fecha_entrega: "2026-11-12", estado: "Atrasado" },
    createdBy: "Marta Gómez",
    createdAt: "2026-11-05T09:00:00Z",
    updatedAt: "2026-11-05T09:00:00Z",
  },
  {
    id: "rec-ped2",
    blockId: "block-pedidos",
    houseId: "house-almacen-ventas",
    data: { proveedor: "Textiles del Sur", material: "Tintes reactivos azul", fecha_entrega: "2026-11-17", estado: "Pendiente" },
    createdBy: "Marta Gómez",
    createdAt: "2026-11-08T10:00:00Z",
    updatedAt: "2026-11-08T10:00:00Z",
  },
];

export const initialRelation: Relation = {
  id: "rel-productos-ventas",
  houseId: "house-almacen-ventas",
  name: "Cruce Productos ⋈ Ventas diarias",
  sourceBlockId: "block-productos",
  targetBlockId: "block-ventas",
  sourceFieldId: "nombre",
  targetFieldId: "producto",
  calculatedFields: [
    {
      id: "total_ingreso",
      label: "Total generado",
      operation: "multiply",
      sourceFieldId: "precio",
      targetFieldId: "cantidad",
      format: "currency",
    },
  ],
  createdAt: "2026-11-01T12:00:00Z",
};

function safeGetItem<T>(key: string, fallback: T[]): T[] {
  try {
    if (typeof window === "undefined" || !window.localStorage) return fallback;
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    return fallback;
  } catch (e) {
    return fallback;
  }
}

// Carga y guardado con persistencia
export const storageService = {
  getHouses(): House[] {
    return safeGetItem(STORAGE_KEYS.HOUSES, [initialHouse]);
  },

  saveHouses(houses: House[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.HOUSES, JSON.stringify(houses));
      if (isSupabaseConfigured) syncWithSupabase("casas", "insert", houses);
    } catch (e) {}
  },

  getBlocks(): Block[] {
    return safeGetItem(STORAGE_KEYS.BLOCKS, initialBlocks);
  },

  saveBlocks(blocks: Block[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.BLOCKS, JSON.stringify(blocks));
      if (isSupabaseConfigured) syncWithSupabase("bloques", "insert", blocks);
    } catch (e) {}
  },

  getRecords(): RecordItem[] {
    return safeGetItem(STORAGE_KEYS.RECORDS, initialRecords);
  },

  saveRecords(records: RecordItem[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(records));
      if (isSupabaseConfigured) syncWithSupabase("registros", "insert", records);
    } catch (e) {}
  },

  getRelations(): Relation[] {
    return safeGetItem(STORAGE_KEYS.RELATIONS, [initialRelation]);
  },

  saveRelations(relations: Relation[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.RELATIONS, JSON.stringify(relations));
      if (isSupabaseConfigured) syncWithSupabase("relaciones", "insert", relations);
    } catch (e) {}
  },
};
