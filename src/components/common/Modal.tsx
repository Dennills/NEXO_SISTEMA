import { ReactNode, useEffect } from "react";

export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = "max-w-[620px]",
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  maxWidth?: string;
}) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "auto";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#162725]/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div
        className={`relative z-10 w-full ${maxWidth} rounded-[28px] border border-[#dce8e6] bg-white p-6 shadow-[0_20px_60px_rgba(20,45,42,.18)] md:p-8`}
        role="dialog"
        aria-modal="true"
      >
        <div className="mb-6 flex items-start justify-between border-b border-[#edf3f2] pb-4">
          <div>
            <h3 className="title-font text-2xl font-semibold text-[#1e3431]">{title}</h3>
            {subtitle && <p className="mt-1 text-sm text-[#6c7d7a]">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-full text-[#758683] transition hover:bg-[#f1f6f5] hover:text-[#233835]"
            aria-label="Cerrar ventana"
          >
            ✕
          </button>
        </div>

        <div>{children}</div>
      </div>
    </div>
  );
}
