# Nexo - Código fuente

## src/App.tsx

```tsx
import { FormEvent, ReactNode, useEffect, useMemo, useState } from "react";

type Page = "houses" | "create" | "dashboard" | "products" | "add-product" | "relate";
type Product = { name: string; price: number; stock: number };

const initialProducts: Product[] = [
  { name: "Tela azul marino", price: 18.5, stock: 42 },
  { name: "Hilo blanco", price: 3.75, stock: 8 },
  { name: "Botones de nácar", price: 6.2, stock: 0 },
  { name: "Cremallera beige", price: 4.8, stock: 15 },
  { name: "Cinta de algodón", price: 7.25, stock: 27 },
];

const pageTitles: Record<Page, string> = {
  houses: "Mis casas",
  create: "Crear una casa",
  dashboard: "Almacén y ventas",
  products: "Productos",
  "add-product": "Agregar producto",
  relate: "Relacionar bloques",
};

function Icon({
  name,
  className = "h-5 w-5",
}: {
  name: "home" | "grid" | "box" | "link" | "plus" | "arrow" | "search" | "check" | "chevron" | "bag";
  className?: string;
}) {
  const paths: Record<string, ReactNode> = {
    home: <><path d="m3 11 9-8 9 8" /><path d="M5 10v10h14V10M9 20v-6h6v6" /></>,
    grid: <><rect x="3" y="3" width="7" height="7" rx="2" /><rect x="14" y="3" width="7" height="7" rx="2" /><rect x="3" y="14" width="7" height="7" rx="2" /><rect x="14" y="14" width="7" height="7" rx="2" /></>,
    box: <><path d="m4 7 8-4 8 4-8 4-8-4Z" /><path d="m4 7 8 4 8-4v10l-8 4-8-4V7Z" /><path d="M12 11v10" /></>,
    link: <><path d="M10 13a5 5 0 0 0 7.1.1l2-2a5 5 0 0 0-7.1-7.1l-1.1 1.1" /><path d="M14 11a5 5 0 0 0-7.1-.1l-2 2A5 5 0 0 0 12 20l1.1-1.1" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    arrow: <><path d="M5 12h14M14 7l5 5-5 5" /></>,
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    chevron: <path d="m9 18 6-6-6-6" />,
    bag: <><path d="M5 8h14l-1 13H6L5 8Z" /><path d="M9 9V6a3 3 0 0 1 6 0v3" /></>,
  };
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

function AppShell({
  page,
  navigate,
  children,
}: {
  page: Page;
  navigate: (page: Page) => void;
  children: ReactNode;
}) {
  const nav = [
    { page: "houses" as Page, label: "Mis casas", icon: "home" as const },
    { page: "dashboard" as Page, label: "Vista general", icon: "grid" as const },
    { page: "products" as Page, label: "Productos", icon: "box" as const },
    { page: "relate" as Page, label: "Relaciones", icon: "link" as const },
  ];
  return (
    <div className="min-h-screen bg-[#f7faf9] text-[#263533]">
      <header className="fixed inset-x-0 top-0 z-30 flex h-[72px] items-center justify-between border-b border-[#dde8e6] bg-white px-5 md:px-9">
        <button onClick={() => navigate("houses")} className="flex items-center gap-3" aria-label="Ir a Mis casas">
          <span className="grid h-10 w-10 place-items-center rounded-[14px] bg-[#00cec8] text-xl font-bold text-white">N</span>
          <span className="title-font text-[25px] font-semibold tracking-[-0.03em] text-[#173c3a]">Nexo</span>
        </button>
        <div className="flex items-center gap-3">
          <button className="hidden rounded-full border border-[#dce7e5] px-4 py-2 text-sm font-semibold text-[#526461] sm:block">Ayuda</button>
          <button className="grid h-10 w-10 place-items-center rounded-full bg-[#e4f7f5] text-sm font-bold text-[#087e7b]" aria-label="Perfil de Marta">MG</button>
        </div>
      </header>

      <aside className="fixed bottom-0 left-0 right-0 z-20 border-t border-[#dde8e6] bg-white md:top-[72px] md:right-auto md:w-[236px] md:border-r md:border-t-0">
        <nav className="flex justify-around p-2 md:block md:p-5">
          <p className="mb-3 hidden px-3 text-[11px] font-bold uppercase tracking-[.16em] text-[#92a09e] md:block">Organización</p>
          {nav.map((item) => {
            const active = page === item.page || (page === "add-product" && item.page === "products");
            return (
              <button
                key={item.page}
                onClick={() => navigate(item.page)}
                className={`flex min-w-[66px] flex-col items-center gap-1 rounded-xl px-2 py-2 text-[11px] font-semibold transition md:mb-1 md:w-full md:flex-row md:gap-3 md:px-3 md:py-3 md:text-sm ${
                  active ? "bg-[#e2f8f6] text-[#007b78]" : "text-[#667572] hover:bg-[#f3f7f6]"
                }`}
              >
                <Icon name={item.icon} className="h-5 w-5" />
                {item.label}
              </button>
            );
          })}
        </nav>
        <div className="absolute bottom-7 left-5 right-5 hidden rounded-2xl bg-[#f1f5f4] p-4 md:block">
          <div className="mb-2 flex items-center gap-2 text-xs font-bold text-[#536460]"><span className="h-2 w-2 rounded-full bg-[#00b9b3]" />Todo al día</div>
          <p className="text-xs leading-5 text-[#788682]">Tus datos se guardaron hace unos segundos.</p>
        </div>
      </aside>

      <main className="px-5 pb-28 pt-[104px] md:ml-[236px] md:px-10 md:pb-16 lg:px-14">
        <div className="mx-auto max-w-[1180px]">{children}</div>
      </main>
    </div>
  );
}

function PageHeading({ eyebrow, title, text, action }: { eyebrow?: string; title: string; text: string; action?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
      <div>
        {eyebrow && <p className="mb-2 text-xs font-bold uppercase tracking-[.16em] text-[#009e9b]">{eyebrow}</p>}
        <h1 className="title-font text-[34px] font-semibold leading-tight tracking-[-.025em] text-[#1f3432] md:text-[42px]">{title}</h1>
        <p className="mt-2 max-w-2xl text-[15px] leading-6 text-[#6b7977]">{text}</p>
      </div>
      {action}
    </div>
  );
}

function PrimaryButton({ children, onClick, type = "button", disabled = false }: { children: ReactNode; onClick?: () => void; type?: "button" | "submit"; disabled?: boolean }) {
  return <button type={type} disabled={disabled} onClick={onClick} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#009e9b] px-5 text-sm font-bold text-white shadow-[0_5px_16px_rgba(0,158,155,.18)] transition hover:bg-[#008985] disabled:cursor-not-allowed disabled:opacity-50">{children}</button>;
}

function Houses({ navigate, houses }: { navigate: (p: Page) => void; houses: { name: string; color: string }[] }) {
  return (
    <>
      <PageHeading title="Mis casas" text="Todo lo que necesitas para cuidar tu negocio, organizado en un solo lugar." action={<PrimaryButton onClick={() => navigate("create")}><Icon name="plus" />Nueva casa</PrimaryButton>} />
      <section className="grid gap-5 lg:grid-cols-2">
        <button onClick={() => navigate("dashboard")} className="group overflow-hidden rounded-[24px] border border-[#dbe8e5] bg-white p-0 text-left shadow-[0_8px_30px_rgba(31,61,57,.05)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_34px_rgba(31,61,57,.09)]">
          <div className="h-2 bg-[#00cec8]" />
          <div className="p-6 md:p-7">
            <div className="mb-7 flex items-start justify-between">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#ddf8f6] text-[#008d89]"><Icon name="bag" /></span>
              <span className="rounded-full bg-[#eef8f6] px-3 py-1.5 text-xs font-bold text-[#26746f]">2 bloques</span>
            </div>
            <h2 className="title-font text-2xl font-semibold text-[#203b38]">Almacén y ventas</h2>
            <p className="mt-2 text-sm leading-6 text-[#71817e]">Controla existencias, productos y ventas diarias de tu taller.</p>
            <div className="mt-7 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-[#f7faf9] p-3"><p className="text-xs text-[#80908d]">Productos</p><p className="mt-1 text-lg font-bold text-[#2d4441]">148</p></div>
              <div className="rounded-xl bg-[#f7faf9] p-3"><p className="text-xs text-[#80908d]">Ventas este mes</p><p className="mt-1 text-lg font-bold text-[#2d4441]">$24.680</p></div>
            </div>
            <div className="mt-6 flex items-center gap-2 text-sm font-bold text-[#008d89]">Abrir casa <Icon name="arrow" className="h-4 w-4 transition group-hover:translate-x-1" /></div>
          </div>
        </button>
        {houses.map((house) => (
          <div key={house.name} className="overflow-hidden rounded-[24px] border border-[#dbe8e5] bg-white shadow-[0_8px_30px_rgba(31,61,57,.05)]">
            <div className="h-2" style={{ background: house.color }} />
            <div className="p-7">
              <span className="mb-7 grid h-12 w-12 place-items-center rounded-2xl bg-[#f2effc] text-[#534ab7]"><Icon name="home" /></span>
              <h2 className="title-font text-2xl font-semibold">{house.name}</h2>
              <p className="mt-2 text-sm text-[#71817e]">Tu nueva casa está lista para recibir bloques.</p>
              <div className="mt-10 border-t border-[#edf1f0] pt-5 text-sm font-semibold text-[#788683]">0 bloques · Creada hoy</div>
            </div>
          </div>
        ))}
        <button onClick={() => navigate("create")} className="flex min-h-[330px] flex-col items-center justify-center rounded-[24px] border-2 border-dashed border-[#cbdad7] bg-transparent p-8 text-center transition hover:border-[#00b7b1] hover:bg-[#f3fbfa]">
          <span className="mb-4 grid h-12 w-12 place-items-center rounded-full bg-white text-[#009e9b] shadow-sm"><Icon name="plus" /></span>
          <span className="title-font text-xl font-semibold text-[#35514e]">Crear otra casa</span>
          <span className="mt-2 max-w-[240px] text-sm leading-6 text-[#7b8987]">Organiza una nueva parte de tu negocio a tu manera.</span>
        </button>
      </section>
    </>
  );
}

function CreateHouse({ navigate, onCreate }: { navigate: (p: Page) => void; onCreate: (name: string, color: string) => void }) {
  const [name, setName] = useState("");
  const [color, setColor] = useState("#00cec8");
  const colors = ["#00cec8", "#534ab7", "#d85a30", "#e3aa27"];
  function submit(e: FormEvent) {
    e.preventDefault();
    if (name.trim()) onCreate(name.trim(), color);
  }
  return (
    <div className="mx-auto max-w-[720px]">
      <button onClick={() => navigate("houses")} className="mb-5 flex items-center gap-2 text-sm font-semibold text-[#687a77]"><span className="rotate-180"><Icon name="arrow" className="h-4 w-4" /></span>Volver a mis casas</button>
      <PageHeading eyebrow="Paso 1 de 1" title="Crear una casa" text="Ponle un nombre claro para que siempre sepas qué información vive aquí." />
      <form onSubmit={submit} className="rounded-[24px] border border-[#dce8e6] bg-white p-6 shadow-[0_10px_35px_rgba(30,61,56,.06)] md:p-9">
        <label className="mb-3 block text-sm font-bold text-[#344b47]" htmlFor="house-name">Nombre de la casa</label>
        <input id="house-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej. Producción y pedidos" autoFocus className="h-13 w-full rounded-xl border border-[#cfdcda] px-4 text-[15px] outline-none transition placeholder:text-[#9da9a7] focus:border-[#00aaa6] focus:ring-4 focus:ring-[#00cec8]/10" />
        <p className="mt-2 text-xs text-[#7c8a88]">Usa un nombre corto y fácil de reconocer.</p>
        <fieldset className="mt-8">
          <legend className="mb-4 text-sm font-bold text-[#344b47]">Color identificador</legend>
          <div className="flex gap-3">
            {colors.map((c) => <button key={c} type="button" onClick={() => setColor(c)} aria-label={`Elegir color ${c}`} className={`grid h-12 w-12 place-items-center rounded-full transition ${color === c ? "ring-2 ring-[#263f3b] ring-offset-3" : ""}`} style={{ backgroundColor: c }}>{color === c && <Icon name="check" className="h-5 w-5 text-white" />}</button>)}
          </div>
        </fieldset>
        <div className="mt-9 rounded-2xl bg-[#f5f9f8] p-5">
          <p className="mb-3 text-xs font-bold uppercase tracking-[.13em] text-[#82918e]">Así se verá</p>
          <div className="flex items-center gap-4"><span className="h-11 w-2 rounded-full" style={{ backgroundColor: color }} /><div><p className="title-font text-xl font-semibold text-[#2c4541]">{name || "Nombre de tu casa"}</p><p className="text-xs text-[#83918f]">0 bloques</p></div></div>
        </div>
        <div className="mt-8 flex justify-end gap-3"><button type="button" onClick={() => navigate("houses")} className="h-11 rounded-xl px-5 text-sm font-bold text-[#60716e]">Cancelar</button><PrimaryButton type="submit" disabled={!name.trim()}>Crear casa <Icon name="arrow" className="h-4 w-4" /></PrimaryButton></div>
      </form>
    </div>
  );
}

const sales = [
  { day: "Lun", value: 58, amount: "$2.480" }, { day: "Mar", value: 78, amount: "$3.260" }, { day: "Mié", value: 48, amount: "$2.050" },
  { day: "Jue", value: 92, amount: "$3.840" }, { day: "Vie", value: 72, amount: "$3.020" }, { day: "Sáb", value: 100, amount: "$4.180" }, { day: "Dom", value: 62, amount: "$2.590" },
];

function Dashboard({ navigate }: { navigate: (p: Page) => void }) {
  return (
    <>
      <PageHeading eyebrow="Casa" title="Almacén y ventas" text="Una vista sencilla de cómo se mueve tu negocio hoy." action={<PrimaryButton onClick={() => navigate("relate")}><span className="text-lg leading-none">⋈</span> Relacionar bloques</PrimaryButton>} />
      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <button onClick={() => navigate("products")} className="group flex items-center justify-between rounded-[20px] border border-[#d9e7e4] bg-white p-5 text-left shadow-[0_5px_20px_rgba(30,61,56,.04)] transition hover:border-[#7ddbd7]">
          <div className="flex items-center gap-4"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#ddf7f5] text-[#008c88]"><Icon name="box" /></span><div><p className="text-xs font-bold uppercase tracking-wider text-[#82918e]">Bloque</p><h3 className="title-font text-xl font-semibold">Productos</h3><p className="mt-0.5 text-sm text-[#788885]">148 registros</p></div></div><Icon name="chevron" className="h-5 w-5 text-[#7e8f8c] transition group-hover:translate-x-1" />
        </button>
        <button className="group flex items-center justify-between rounded-[20px] border border-[#d9e7e4] bg-white p-5 text-left shadow-[0_5px_20px_rgba(30,61,56,.04)]">
          <div className="flex items-center gap-4"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#f0edfb] text-[#534ab7]"><Icon name="grid" /></span><div><p className="text-xs font-bold uppercase tracking-wider text-[#82918e]">Bloque</p><h3 className="title-font text-xl font-semibold">Ventas diarias</h3><p className="mt-0.5 text-sm text-[#788885]">32 registros este mes</p></div></div><Icon name="chevron" className="h-5 w-5 text-[#7e8f8c]" />
        </button>
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.55fr_1fr]">
        <section className="rounded-[24px] border border-[#dce8e6] bg-white p-6 shadow-[0_7px_26px_rgba(30,61,56,.04)] md:p-7">
          <div className="flex items-start justify-between"><div><p className="text-sm font-bold text-[#3d5551]">Ventas de la semana</p><p className="title-font mt-1 text-[30px] font-semibold">$21.420</p></div><span className="rounded-full bg-[#e1f7ef] px-3 py-1.5 text-xs font-bold text-[#16825f]">+12,4%</span></div>
          <div className="mt-7 flex h-[220px] items-end gap-3 border-b border-[#e5ecea] sm:gap-5">
            {sales.map((sale, index) => <div key={sale.day} className="group flex h-full flex-1 flex-col justify-end"><div className="relative w-full rounded-t-[7px] bg-[#7ee1dd] transition hover:bg-[#00bdb7]" style={{ height: `${sale.value}%` }}><span className="absolute -top-8 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-[#243c38] px-2 py-1 text-[10px] font-bold text-white group-hover:block">{sale.amount}</span></div><p className={`py-3 text-center text-[11px] font-semibold ${index === 5 ? "text-[#008f8b]" : "text-[#859390]"}`}>{sale.day}</p></div>)}
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-[#82918e]"><span className="h-2.5 w-2.5 rounded-sm bg-[#7ee1dd]" /> Ventas registradas automáticamente</div>
        </section>
        <section className="rounded-[24px] border border-[#dce8e6] bg-white p-6 shadow-[0_7px_26px_rgba(30,61,56,.04)] md:p-7">
          <div className="mb-5 flex items-center justify-between"><div><p className="text-sm font-bold text-[#3d5551]">Prioridades</p><p className="mt-1 text-xs text-[#899694]">Lo que necesita tu atención</p></div><span className="rounded-full bg-[#f6f8f7] px-3 py-1 text-xs font-semibold">Hoy</span></div>
          <div className="space-y-3">
            {[
              ["Botones de nácar", "Sin existencias", "#d85a30", "#fff0eb"],
              ["Hilo blanco", "Quedan 8 unidades", "#d59b16", "#fff8e5"],
              ["Cremallera beige", "Stock moderado", "#d59b16", "#fff8e5"],
              ["Tela azul marino", "Existencias suficientes", "#20a06b", "#eaf8f1"],
            ].map(([name, status, color, bg]) => <div key={name} className="flex items-center gap-3 rounded-2xl p-3.5" style={{ backgroundColor: bg }}><span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: color }} /><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold text-[#3b504d]">{name}</p><p className="mt-0.5 text-xs text-[#72817e]">{status}</p></div><Icon name="chevron" className="h-4 w-4 text-[#8a9795]" /></div>)}
          </div>
        </section>
      </div>
    </>
  );
}

function Products({ navigate, products }: { navigate: (p: Page) => void; products: Product[] }) {
  const [query, setQuery] = useState("");
  const filtered = products.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()));
  return (
    <>
      <button onClick={() => navigate("dashboard")} className="mb-5 flex items-center gap-2 text-sm font-semibold text-[#687a77]"><span className="rotate-180"><Icon name="arrow" className="h-4 w-4" /></span>Almacén y ventas</button>
      <PageHeading eyebrow="Bloque" title="Productos" text="Consulta precios y existencias. Todo está ordenado para encontrarlo rápido." action={<PrimaryButton onClick={() => navigate("add-product")}><Icon name="plus" />Agregar producto</PrimaryButton>} />
      <section className="overflow-hidden rounded-[24px] border border-[#dce8e6] bg-white shadow-[0_7px_26px_rgba(30,61,56,.04)]">
        <div className="flex flex-col justify-between gap-4 border-b border-[#e5ecea] p-5 sm:flex-row sm:items-center md:px-7">
          <div className="relative w-full sm:max-w-[360px]"><Icon name="search" className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#879592]" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar por nombre..." className="h-11 w-full rounded-xl border border-[#d7e1df] bg-[#fafcfb] pl-11 pr-4 text-sm outline-none focus:border-[#00aaa6] focus:ring-3 focus:ring-[#00cec8]/10" /></div>
          <p className="text-sm text-[#7d8a88]"><strong className="text-[#3f5551]">{filtered.length}</strong> productos</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[650px] text-left">
            <thead className="bg-[#f7faf9] text-[11px] font-bold uppercase tracking-[.12em] text-[#7d8b88]"><tr><th className="px-7 py-4">Nombre</th><th className="px-6 py-4">Precio</th><th className="px-6 py-4">Stock</th><th className="px-7 py-4 text-right">Estado</th></tr></thead>
            <tbody className="divide-y divide-[#e9efed]">
              {filtered.map((p) => {
                const status = p.stock === 0 ? ["Agotado", "bg-[#fff0eb] text-[#b84824]"] : p.stock < 10 ? ["Stock bajo", "bg-[#fff6df] text-[#a36c00]"] : ["Disponible", "bg-[#e8f7f0] text-[#187b59]"];
                return <tr key={p.name} className="transition hover:bg-[#fbfdfc]"><td className="px-7 py-5"><div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-xl bg-[#e7f7f5] text-[#008f8b]"><Icon name="box" className="h-4 w-4" /></span><span className="font-semibold text-[#354c48]">{p.name}</span></div></td><td className="px-6 py-5 font-semibold text-[#526460]">${p.price.toFixed(2)}</td><td className="px-6 py-5 font-semibold text-[#526460]">{p.stock} uds.</td><td className="px-7 py-5 text-right"><span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${status[1]}`}>{status[0]}</span></td></tr>;
              })}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

function AddProduct({ navigate, onAdd }: { navigate: (p: Page) => void; onAdd: (p: Product) => void }) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [touched, setTouched] = useState(false);
  const priceError = touched && (!price || Number(price) <= 0);
  function submit(e: FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (name.trim() && Number(price) > 0 && Number(stock) >= 0) onAdd({ name: name.trim(), price: Number(price), stock: Number(stock) });
  }
  return (
    <div className="mx-auto max-w-[720px]">
      <button onClick={() => navigate("products")} className="mb-5 flex items-center gap-2 text-sm font-semibold text-[#687a77]"><span className="rotate-180"><Icon name="arrow" className="h-4 w-4" /></span>Volver a productos</button>
      <PageHeading eyebrow="Nuevo registro" title="Agregar producto" text="Completa un dato por vez. Podrás editar esta información más adelante." />
      <form onSubmit={submit} className="rounded-[24px] border border-[#dce8e6] bg-white p-6 shadow-[0_10px_35px_rgba(30,61,56,.06)] md:p-9">
        <div className="mb-7 flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-full bg-[#00b9b3] text-sm font-bold text-white">1</span><div className="h-1 flex-1 rounded-full bg-[#d9f4f2]"><div className="h-full w-1/3 rounded-full bg-[#00b9b3]" /></div><span className="text-xs font-bold text-[#788986]">Datos básicos</span></div>
        <label className="mb-2 block text-sm font-bold text-[#344b47]" htmlFor="product-name">Nombre</label>
        <input id="product-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej. Tela de lino natural" className="mb-6 h-12 w-full rounded-xl border border-[#cfdcda] px-4 text-[15px] outline-none focus:border-[#00aaa6] focus:ring-4 focus:ring-[#00cec8]/10" />
        <label className="mb-2 block text-sm font-bold text-[#344b47]" htmlFor="product-price">Precio</label>
        <div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 font-semibold text-[#71817e]">$</span><input id="product-price" type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} onBlur={() => setTouched(true)} placeholder="0.00" className={`h-12 w-full rounded-xl border pl-8 pr-4 text-[15px] outline-none focus:ring-4 ${priceError ? "border-[#d85a30] bg-[#fffaf8] focus:ring-[#d85a30]/10" : "border-[#cfdcda] focus:border-[#00aaa6] focus:ring-[#00cec8]/10"}`} /></div>
        {priceError ? <p className="mt-2 flex items-center gap-2 text-xs font-semibold text-[#b84824]"><span className="grid h-4 w-4 place-items-center rounded-full bg-[#d85a30] text-[10px] text-white">!</span>Ingresa un precio mayor que $0.</p> : <p className="mt-2 text-xs text-[#7c8a88]">Usa números, por ejemplo: 18.50</p>}
        <label className="mb-2 mt-6 block text-sm font-bold text-[#344b47]" htmlFor="product-stock">Stock inicial</label>
        <div className="relative"><input id="product-stock" type="number" min="0" value={stock} onChange={(e) => setStock(e.target.value)} placeholder="0" className="h-12 w-full rounded-xl border border-[#cfdcda] px-4 pr-24 text-[15px] outline-none focus:border-[#00aaa6] focus:ring-4 focus:ring-[#00cec8]/10" /><span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#81908d]">unidades</span></div>
        <div className="mt-9 flex justify-end gap-3 border-t border-[#e7eeec] pt-6"><button type="button" onClick={() => navigate("products")} className="h-11 rounded-xl px-5 text-sm font-bold text-[#60716e]">Cancelar</button><PrimaryButton type="submit">Guardar <Icon name="check" className="h-4 w-4" /></PrimaryButton></div>
      </form>
    </div>
  );
}

function Relate({ navigate }: { navigate: (p: Page) => void }) {
  const [related, setRelated] = useState(false);
  return (
    <>
      <button onClick={() => navigate("dashboard")} className="mb-5 flex items-center gap-2 text-sm font-semibold text-[#687a77]"><span className="rotate-180"><Icon name="arrow" className="h-4 w-4" /></span>Almacén y ventas</button>
      <PageHeading eyebrow="Cruzar información" title="Relacionar bloques" text="Conecta dos bloques para ver sus datos juntos, sin hacer cálculos manuales." />
      <section className="rounded-[24px] border border-[#dce8e6] bg-white p-6 shadow-[0_7px_26px_rgba(30,61,56,.04)] md:p-8">
        <div className="grid items-end gap-4 md:grid-cols-[1fr_52px_1fr]">
          <div><label className="mb-2 block text-sm font-bold text-[#3c524e]">Primer bloque</label><div className="relative"><select className="h-12 w-full appearance-none rounded-xl border border-[#cfddda] bg-white px-4 text-sm font-semibold outline-none focus:border-[#00aaa6]"><option>Productos</option></select><Icon name="chevron" className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 rotate-90 text-[#6e7e7b]" /></div></div>
          <div className="grid h-12 w-12 place-items-center rounded-full bg-[#dff7f5] text-xl font-bold text-[#008d89]">⋈</div>
          <div><label className="mb-2 block text-sm font-bold text-[#3c524e]">Segundo bloque</label><div className="relative"><select className="h-12 w-full appearance-none rounded-xl border border-[#cfddda] bg-white px-4 text-sm font-semibold outline-none focus:border-[#00aaa6]"><option>Ventas diarias</option></select><Icon name="chevron" className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 rotate-90 text-[#6e7e7b]" /></div></div>
        </div>
        <div className="mt-6 rounded-2xl bg-[#f5f9f8] p-5">
          <label className="mb-2 block text-sm font-bold text-[#3c524e]">¿Qué dato tienen en común?</label>
          <div className="relative max-w-[480px]"><select className="h-12 w-full appearance-none rounded-xl border border-[#cfddda] bg-white px-4 text-sm font-semibold outline-none"><option>Nombre del producto</option></select><Icon name="chevron" className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 rotate-90 text-[#6e7e7b]" /></div>
          <p className="mt-2 text-xs text-[#7a8986]">Nexo usará este dato para encontrar las coincidencias.</p>
        </div>
        <div className="mt-6 flex justify-end"><PrimaryButton onClick={() => setRelated(true)}><span className="text-lg">⋈</span>Relacionar</PrimaryButton></div>
      </section>
      <section className={`mt-6 overflow-hidden rounded-[24px] border bg-white shadow-[0_7px_26px_rgba(30,61,56,.04)] transition ${related ? "border-[#69d5d1] ring-4 ring-[#00cec8]/10" : "border-[#dce8e6]"}`}>
        <div className="flex flex-col justify-between gap-3 border-b border-[#e5ecea] p-5 sm:flex-row sm:items-center md:px-7"><div><div className="flex items-center gap-2"><h2 className="title-font text-xl font-semibold">Vista previa combinada</h2>{related && <span className="rounded-full bg-[#e0f7ef] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#167c5a]">Relación creada</span>}</div><p className="mt-1 text-xs text-[#7f8d8a]">Productos ⋈ Ventas diarias</p></div><span className="text-xs font-semibold text-[#7b8987]">Últimos 7 días</span></div>
        <div className="overflow-x-auto"><table className="w-full min-w-[700px] text-left"><thead className="bg-[#f7faf9] text-[11px] font-bold uppercase tracking-wider text-[#7c8a87]"><tr><th className="px-7 py-4">Producto</th><th className="px-5 py-4">Precio</th><th className="px-5 py-4">Stock</th><th className="px-5 py-4">Unidades vendidas</th><th className="px-7 py-4">Total</th></tr></thead><tbody className="divide-y divide-[#e9efed]">{[
          ["Tela azul marino", "$18.50", "42", "18", "$333.00"], ["Hilo blanco", "$3.75", "8", "31", "$116.25"], ["Botones de nácar", "$6.20", "0", "24", "$148.80"], ["Cremallera beige", "$4.80", "15", "12", "$57.60"],
        ].map((row) => <tr key={row[0]}>{row.map((cell, i) => <td key={cell} className={`${i === 0 || i === 4 ? "px-7" : "px-5"} py-4 text-sm ${i === 0 ? "font-bold text-[#3a514d]" : i === 4 ? "font-bold text-[#008d89]" : "text-[#60706d]"}`}>{cell}</td>)}</tr>)}</tbody></table></div>
      </section>
    </>
  );
}

function parsePage(): Page {
  const value = window.location.hash.replace("#/", "") as Page;
  return pageTitles[value] ? value : "houses";
}

export default function App() {
  const [page, setPage] = useState<Page>(parsePage);
  const [products, setProducts] = useState(initialProducts);
  const [houses, setHouses] = useState<{ name: string; color: string }[]>([]);
  useEffect(() => {
    const update = () => setPage(parsePage());
    window.addEventListener("hashchange", update);
    return () => window.removeEventListener("hashchange", update);
  }, []);
  useEffect(() => { document.title = `${pageTitles[page]} · Nexo`; }, [page]);
  const navigate = (next: Page) => {
    window.location.hash = `/${next}`;
    setPage(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const screen = useMemo(() => {
    if (page === "create") return <CreateHouse navigate={navigate} onCreate={(name, color) => { setHouses((h) => [...h, { name, color }]); navigate("houses"); }} />;
    if (page === "dashboard") return <Dashboard navigate={navigate} />;
    if (page === "products") return <Products navigate={navigate} products={products} />;
    if (page === "add-product") return <AddProduct navigate={navigate} onAdd={(product) => { setProducts((p) => [product, ...p]); navigate("products"); }} />;
    if (page === "relate") return <Relate navigate={navigate} />;
    return <Houses navigate={navigate} houses={houses} />;
  }, [page, products, houses]);
  return <AppShell page={page} navigate={navigate}>{screen}</AppShell>;
}
```

## src/index.css

```css
@import url("https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Lora:wght@500;600&display=swap");
@import "tailwindcss";

:root {
  font-family: "DM Sans", sans-serif;
  color: #263533;
  background: #f7faf9;
  font-synthesis: none;
}

body {
  margin: 0;
  min-width: 320px;
  min-height: 100vh;
}

button,
input,
select {
  font: inherit;
}

button {
  cursor: pointer;
}

.title-font {
  font-family: "Lora", Georgia, serif;
}

::selection {
  background: #b9efec;
  color: #17423f;
}
```
