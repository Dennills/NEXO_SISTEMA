import { FormEvent, useState } from "react";
import { Block, FieldDefinition } from "../../types/nexo";
import { Modal } from "../common/Modal";
import { Icon } from "../common/Icon";

export function RecordFormModal({
  isOpen,
  onClose,
  block,
  onSave,
  initialData,
}: {
  isOpen: boolean;
  onClose: () => void;
  block: Block;
  onSave: (data: Record<string, any>) => void;
  initialData?: Record<string, any>;
}) {
  const [formData, setFormData] = useState<Record<string, any>>(() => initialData || {});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate(current: Record<string, any>) {
    const errs: Record<string, string> = {};
    block.fields.forEach((field) => {
      const val = current[field.id];
      if (field.required && (val === undefined || val === null || String(val).trim() === "")) {
        errs[field.id] = `El campo "${field.name}" es obligatorio.`;
      } else if ((field.type === "number" || field.type === "currency") && val !== undefined && val !== "") {
        if (isNaN(Number(val))) {
          errs[field.id] = "Debe ser un valor numérico.";
        } else if (Number(val) < 0) {
          errs[field.id] = "No puede ser un número negativo.";
        }
      }
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleChange(fieldId: string, val: any) {
    const updated = { ...formData, [fieldId]: val };
    setFormData(updated);
    if (touched[fieldId]) {
      validate(updated);
    }
  }

  function handleBlur(fieldId: string) {
    setTouched((prev) => ({ ...prev, [fieldId]: true }));
    validate(formData);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    // Marcar todos como tocados
    const allTouched: Record<string, boolean> = {};
    block.fields.forEach((f) => (allTouched[f.id] = true));
    setTouched(allTouched);

    if (validate(formData)) {
      onSave(formData);
      setFormData({});
      onClose();
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? "Editar Registro" : "Nuevo Registro"}
      subtitle={`Formulario guiado para el bloque: ${block.name}`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {block.fields.map((field: FieldDefinition, index: number) => {
          const val = formData[field.id] ?? "";
          const hasError = touched[field.id] && errors[field.id];

          return (
            <div key={field.id} className="rounded-2xl bg-[#f8faf9] p-3.5 border border-[#e7eeec]">
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-xs font-bold text-[#304542]">
                  <span className="mr-1.5 text-[#009e9b]">{index + 1}.</span>
                  {field.name}
                  {field.required && <span className="ml-1 text-[#d85a30]">*</span>}
                </label>
                {field.unit && (
                  <span className="text-[11px] font-semibold text-[#81928e]">
                    ({field.unit})
                  </span>
                )}
              </div>

              {/* Renderizar según tipo de campo */}
              {field.type === "currency" ? (
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-[#71827f]">
                    $
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={val}
                    onChange={(e) => handleChange(field.id, e.target.value)}
                    onBlur={() => handleBlur(field.id)}
                    placeholder="0.00"
                    className={`h-11 w-full rounded-xl border pl-8 pr-3 text-sm outline-none bg-white transition ${
                      hasError ? "border-[#d85a30] bg-[#fffaf8]" : "border-[#cedcdc] focus:border-[#00aaa6]"
                    }`}
                  />
                </div>
              ) : field.type === "number" ? (
                <input
                  type="number"
                  min="0"
                  value={val}
                  onChange={(e) => handleChange(field.id, e.target.value)}
                  onBlur={() => handleBlur(field.id)}
                  placeholder="0"
                  className={`h-11 w-full rounded-xl border px-3 text-sm outline-none bg-white transition ${
                    hasError ? "border-[#d85a30] bg-[#fffaf8]" : "border-[#cedcdc] focus:border-[#00aaa6]"
                  }`}
                />
              ) : field.type === "date" ? (
                <input
                  type="date"
                  value={val}
                  onChange={(e) => handleChange(field.id, e.target.value)}
                  onBlur={() => handleBlur(field.id)}
                  className={`h-11 w-full rounded-xl border px-3 text-sm outline-none bg-white transition ${
                    hasError ? "border-[#d85a30] bg-[#fffaf8]" : "border-[#cedcdc] focus:border-[#00aaa6]"
                  }`}
                />
              ) : field.options && field.options.length > 0 ? (
                <select
                  value={val}
                  onChange={(e) => handleChange(field.id, e.target.value)}
                  onBlur={() => handleBlur(field.id)}
                  className="h-11 w-full rounded-xl border border-[#cedcdc] bg-white px-3 text-sm font-semibold outline-none focus:border-[#00aaa6]"
                >
                  <option value="">Selecciona una opción...</option>
                  {field.options.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={val}
                  onChange={(e) => handleChange(field.id, e.target.value)}
                  onBlur={() => handleBlur(field.id)}
                  placeholder={`Ingresa ${field.name.toLowerCase()}...`}
                  className={`h-11 w-full rounded-xl border px-3 text-sm outline-none bg-white transition ${
                    hasError ? "border-[#d85a30] bg-[#fffaf8]" : "border-[#cedcdc] focus:border-[#00aaa6]"
                  }`}
                />
              )}

              {hasError && (
                <p className="mt-1 text-xs font-semibold text-[#b84824]">
                  {errors[field.id]}
                </p>
              )}
            </div>
          );
        })}

        <div className="flex items-center justify-end gap-3 border-t border-[#edf3f1] pt-4">
          <button
            type="button"
            onClick={onClose}
            className="h-11 rounded-xl px-5 text-sm font-bold text-[#627370] hover:bg-[#f1f6f4]"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#009e9b] px-6 text-sm font-bold text-white shadow-[0_5px_16px_rgba(0,158,155,.2)] transition hover:bg-[#008985]"
          >
            <Icon name="check" className="h-4 w-4" />
            <span>Guardar Registro</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
