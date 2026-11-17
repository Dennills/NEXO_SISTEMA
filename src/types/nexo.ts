export type Role = "ADMINISTRADOR" | "OPERADOR";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: Role;
  businessName: string;
}

export type FieldType = "text" | "number" | "currency" | "date" | "status" | "category";

export interface FieldDefinition {
  id: string;
  name: string;
  type: FieldType;
  required: boolean;
  unit?: string;
  options?: string[]; // Para campos tipo status o category
}

export interface Block {
  id: string;
  houseId: string;
  name: string;
  description?: string;
  icon: "box" | "grid" | "bag" | "cart" | "calendar" | "truck" | "clipboard";
  fields: FieldDefinition[];
  createdAt: string;
}

export interface RecordItem {
  id: string;
  blockId: string;
  houseId: string;
  data: Record<string, string | number | boolean>;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Relation {
  id: string;
  houseId: string;
  name: string;
  sourceBlockId: string;
  targetBlockId: string;
  sourceFieldId: string;
  targetFieldId: string;
  calculatedFields?: {
    id: string;
    label: string;
    operation: "multiply" | "subtract" | "add";
    sourceFieldId: string;
    targetFieldId: string;
    format: "currency" | "number";
  }[];
  createdAt: string;
}

export interface House {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  createdAt: string;
}

export interface PriorityItem {
  id: string;
  title: string;
  subtitle: string;
  status: "danger" | "warning" | "success" | "neutral";
  statusText: string;
  sourceBlockName: string;
  recordId: string;
  daysLate?: number;
}

export interface JoinedRow {
  key: string;
  sourceRow: Record<string, any>;
  targetRows: Record<string, any>[];
  calculatedValues: Record<string, number | string>;
}
