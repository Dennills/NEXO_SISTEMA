import { FormEvent, useState } from "react";
import { Block, FieldDefinition, FieldType } from "../../types/nexo";
import { Modal } from "../common/Modal";
import { Icon } from "../common/Icon";

export function CreateBlockModal({
  isOpen,
  onClose,
  onCreate,
}: {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, description: string, icon: Block["icon"], fields: FieldDefinition[]) => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState<Block["icon"]>("box");
  const [fields, setFields] = useState<FieldDefinition[]>([
    { id: "nombre", name: "Nombre / Título", type: "text", required: true },
    { id: "cantidad", name: "Cantidad", type: "number", required: true, unit: "uds." },
  ]);

  const [newFieldName, setNewFieldName] = useState("");
  const [newFieldType, setNewFieldType] = useState<FieldType>("text");
  const [newFieldUnit, setNewFieldUnit] = useState("");

  function addField() {
    if (!newFieldName.trim()) return;
    const cleanId = newFieldName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "_")
      .slice(0, 15) + `_${Date.now().toString().slice(-4)}`;

    const newField: FieldDefinition = {
      id: cleanId,
      name: newFieldName.trim(),
      type: newFieldType,
      required: false,
      unit: newFieldUnit.trim() || undefined,
    };

    setFields([...fields, newField]);
    setNewFieldName("");
    setNewFieldUnit("");
  }

  function removeField(index: number) {
    if (fields.length <= 1) return;
    setFields(fields.filter((_, i) => i !== index));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (name.trim()) {
      onCreate(name.trim(), description.trim(), icon, fields);
      setName("");
      setDescription("");
      onClose();
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Crear Nuevo Bloque"
      subtitle="Define qué tipo de datos o proceso registrarás en este contenedor."
      maxWidth="max-w-[650px]"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="mb-1 block text-xs font-bold text-[#354d49]" htmlFor="block-name">
            Nombre del Bloque
          </label>
          <input
            id="block-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej. Control de Telas, Pedidos de Hilos, Ventas Diarias"
            autoFocus
            className="h-11 w-full rounded-xl border border-[#d2dedc] px-3.5 text-sm outline-none focus:border-[#00aaa6] focus:ring-3 focus:ring-[#00cec8]/10"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-bold text-[#354d49]" htmlFor="block-desc">
            Descripción breve
          </label>
          <input
            id="block-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Para qué sirve este bloque en el día a día..."
            className="h-11 w-full rounded-xl border border-[#d2dedc] px-3.5 text-sm outline-none focus:border-[#00aaa6] focus:ring-3 focus:ring-[#00cec8]/10"
          />
        </div>

        {/* Campos personalizados */}
        <div className="rounded-2xl border border-[#dde7e5] bg-[#f8faf9] p-4">
          <p className="mb-3 text-xs font-bold uppercase tracking-wider text-[#008d89]">
            Campos que tendrá este bloque
          </p>

          <div className="space-y-2">
            {fields.map((f, idx) => (
              <div
                key={f.id}
                className="flex items-center justify-between rounded-xl border border-[#e4eeec] bg-white px-3.5 py-2.5 shadow-2xs"
              >
                <div className="flex items-center gap-2">
                  <span className="grid h-6 w-6 place-items-center rounded-md bg-[#e4f7f5] text-xs font-bold text-[#008a85]">
                    {idx + 1}
                  </span>
                  <div>
                    <p className="text-sm font-bold text-[#2d423f]">{f.name}</p>
                    <p className="text-[11px] text-[#7d8e8b]">
                      Tipo: {f.type} {f.unit ? `· Unidad: ${f.unit}` : ""}
                    </p>
                  </div>
                </div>

                {fields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeField(idx)}
                    className="grid h-7 w-7 place-items-center rounded-lg text-[#95a4a1] hover:bg-[#fff0eb] hover:text-[#b84824]"
                    title="Eliminar campo"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Formulario para agregar campo */}
          <div className="mt-4 border-t border-[#e6eeec] pt-3">
            <p className="mb-2 text-xs font-semibold text-[#576b68]">Agregar otro campo:</p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                value={newFieldName}
                onChange={(e) => setNewFieldName(e.target.value)}
                placeholder="Nombre (ej. Precio, Fecha, Color)"
                className="h-10 flex-1 rounded-xl border border-[#cfddda] bg-white px-3 text-xs outline-none focus:border-[#00aaa6]"
              />
              <select
                value={newFieldType}
                onChange={(e) => setNewFieldType(e.target.value as FieldType)}
                className="h-10 rounded-xl border border-[#cfddda] bg-white px-3 text-xs font-semibold outline-none"
              >
                <option value="text">Texto</option>
                <option value="number">Número</option>
                <option value="currency">Moneda ($)</option>
                <option value="date">Fecha</option>
                <option value="status">Estado</option>
              </select>
              <button
                type="button"
                onClick={addField}
                disabled={!newFieldName.trim()}
                className="h-10 rounded-xl bg-[#008d89] px-4 text-xs font-bold text-white transition hover:bg-[#007b77] disabled:opacity-40"
              >
                + Agregar
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-[#edf3f1] pt-4">
          <button
            type="button"
            onClick={onClose}
            className="h-11 rounded-xl px-5 text-sm font-bold text-[#647572]"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={!name.trim()}
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#009e9b] px-6 text-sm font-bold text-white shadow-md transition hover:bg-[#008985] disabled:opacity-50"
          >
            <Icon name="check" className="h-4 w-4" />
            <span>Crear Bloque</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
