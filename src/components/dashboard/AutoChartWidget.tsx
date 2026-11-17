import { ChartBarData } from "../../lib/engine";

export function AutoChartWidget({
  title,
  subtitle,
  totalDisplay,
  data,
}: {
  title: string;
  subtitle: string;
  totalDisplay: string;
  data: ChartBarData[];
}) {
  return (
    <div className="rounded-[24px] border border-[#dce8e6] bg-white p-6 shadow-[0_7px_26px_rgba(30,61,56,.04)] md:p-7">
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-[#008d89]">
            Generación Automática
          </p>
          <h3 className="title-font text-2xl font-semibold text-[#1e3633]">{title}</h3>
          <p className="mt-0.5 text-xs text-[#7c8d8a]">{subtitle}</p>
        </div>

        <div className="rounded-2xl bg-[#edf9f8] px-4 py-2 text-right">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#007b77]">
            Acumulado
          </p>
          <p className="title-font text-2xl font-bold text-[#006e6a]">{totalDisplay}</p>
        </div>
      </div>

      {/* Gráfico de barras SVG/CSS */}
      <div className="mt-8">
        <div className="flex h-[200px] items-end gap-3 border-b border-[#e5ecea] pb-2 sm:gap-5">
          {data.map((item, idx) => (
            <div key={`${item.label}-${idx}`} className="group relative flex h-full flex-1 flex-col justify-end">
              {/* Barra */}
              <div
                className="relative w-full rounded-t-[8px] bg-[#6dd5d1] transition-all duration-300 hover:bg-[#00b9b3]"
                style={{ height: `${item.value}%` }}
              >
                {/* Tooltip flotante al pasar el cursor */}
                <div className="absolute -top-9 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-[#1f3734] px-2.5 py-1 text-[11px] font-bold text-white shadow-md group-hover:block z-10">
                  {item.displayValue}
                </div>
              </div>

              {/* Etiqueta del eje X */}
              <p className="mt-2 truncate text-center text-[11px] font-semibold text-[#738481]">
                {item.label}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-3 flex items-center justify-between text-xs text-[#7e8f8c]">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-xs bg-[#6dd5d1]" />
            <span>Cálculo directo por reglas matemáticas (sin IA)</span>
          </div>
          <span className="font-semibold text-[#253f3c]">Actualizado en vivo</span>
        </div>
      </div>
    </div>
  );
}
