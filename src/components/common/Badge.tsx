export function StatusBadge({
  status,
  label,
}: {
  status: "danger" | "warning" | "success" | "neutral";
  label: string;
}) {
  const styles = {
    danger: "bg-[#fff0eb] text-[#b84824] border border-[#fbd4c7]",
    warning: "bg-[#fff8e5] text-[#9a6700] border border-[#fae4a8]",
    success: "bg-[#e8f7f0] text-[#147a56] border border-[#bfead7]",
    neutral: "bg-[#f1f5f4] text-[#556663] border border-[#dce5e3]",
  };

  const dots = {
    danger: "bg-[#d85a30]",
    warning: "bg-[#d59b16]",
    success: "bg-[#1da26f]",
    neutral: "bg-[#7e8f8c]",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold tracking-wide ${styles[status]}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dots[status]}`} />
      {label}
    </span>
  );
}
