import { FormEvent, useState } from "react";
import { Modal } from "../common/Modal";
import { Icon } from "../common/Icon";

export function CreateHouseModal({
  isOpen,
  onClose,
  onCreate,
}: {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, description: string, color: string) => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("#00cec8");

  const colors = ["#00cec8", "#534ab7", "#d85a30", "#e3aa27", "#10b981", "#ec4899"];

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (name.trim()) {
      onCreate(name.trim(), description.trim(), color);
      setName("");
      setDescription("");
      onClose();
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Crear Nueva Casa"
      subtitle="Una casa agrupa toda la información de un proceso o área específica de tu negocio."
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="mb-1 block text-xs font-bold text-[#354c48]" htmlFor="house-modal-name">
            Nombre de la Casa
          </label>
          <input
            id="house-modal-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej. Producción Textil, Logística de Proveedores, Almacén General"
            autoFocus
            className="h-11 w-full rounded-xl border border-[#d2dedc] px-3.5 text-sm outline-none focus:border-[#00aaa6] focus:ring-3 focus:ring-[#00cec8]/10"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-bold text-[#354c48]" htmlFor="house-modal-desc">
            Descripción del proceso
          </label>
          <input
            id="house-modal-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="¿Qué área del negocio se gestiona aquí?"
            className="h-11 w-full rounded-xl border border-[#d2dedc] px-3.5 text-sm outline-none focus:border-[#00aaa6] focus:ring-3 focus:ring-[#00cec8]/10"
          />
        </div>

        <div>
          <label className="mb-2 block text-xs font-bold text-[#354c48]">
            Color Identificador
          </label>
          <div className="flex gap-3">
            {colors.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`grid h-10 w-10 place-items-center rounded-full transition ${
                  color === c ? "ring-2 ring-[#263f3b] ring-offset-2" : ""
                }`}
                style={{ backgroundColor: c }}
              >
                {color === c && <Icon name="check" className="h-4 w-4 text-white" />}
              </button>
            ))}
          </div>
        </div>

        {/* Vista previa */}
        <div className="rounded-2xl border border-[#e1eae8] bg-[#f7faf9] p-4">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-[#82928f]">
            Así se verá
          </p>
          <div className="flex items-center gap-3">
            <span className="h-10 w-2 rounded-full" style={{ backgroundColor: color }} />
            <div>
              <p className="title-font text-lg font-semibold text-[#27403c]">
                {name || "Nombre de tu casa"}
              </p>
              <p className="text-xs text-[#7c8d89]">
                {description || "Contenedor listo para recibir bloques"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-[#edf3f1] pt-4">
          <button
            type="button"
            onClick={onClose}
            className="h-11 rounded-xl px-5 text-sm font-bold text-[#627370]"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={!name.trim()}
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#009e9b] px-6 text-sm font-bold text-white shadow-md transition hover:bg-[#008985] disabled:opacity-50"
          >
            <Icon name="check" className="h-4 w-4" />
            <span>Crear Casa</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
