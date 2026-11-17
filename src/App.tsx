import { useEffect, useMemo, useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { NexoProvider, useNexo } from "./context/NexoContext";
import { Header } from "./components/layout/Header";
import { Sidebar } from "./components/layout/Sidebar";
import { LoginPage } from "./components/auth/LoginPage";
import { HouseListView } from "./components/houses/HouseListView";
import { DashboardView } from "./components/dashboard/DashboardView";
import { RelationView } from "./components/relations/RelationView";
import { BlockTableView } from "./components/blocks/BlockTableView";
import { CreateHouseModal } from "./components/houses/CreateHouseModal";
import { CreateBlockModal } from "./components/blocks/CreateBlockModal";

function MainApp() {
  const { user } = useAuth();
  const { houseBlocks, createHouse, createBlock } = useNexo();

  const [route, setRoute] = useState<string>(() => {
    const hash = window.location.hash.replace("#/", "");
    return hash || "dashboard";
  });

  const [isCreateHouseOpen, setIsCreateHouseOpen] = useState(false);
  const [isCreateBlockOpen, setIsCreateBlockOpen] = useState(false);

  // Sincronizar hash de la URL
  useEffect(() => {
    const handleHash = () => {
      const h = window.location.hash.replace("#/", "");
      if (h) setRoute(h);
    };
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  const navigate = (next: string) => {
    window.location.hash = `/${next}`;
    setRoute(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Si no hay usuario activo, mostrar pantalla de inicio de sesión
  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-[#f7faf9] text-[#243734]">
      {/* Barra superior con selector de casas y rol interactivo */}
      <Header
        onNavigate={navigate}
        onOpenCreateHouse={() => setIsCreateHouseOpen(true)}
      />

      {/* Menú lateral adaptado por rol */}
      <Sidebar
        currentRoute={route}
        onNavigate={navigate}
        onOpenCreateBlock={() => setIsCreateBlockOpen(true)}
      />

      {/* Contenedor central dinámico */}
      <main className="px-4 pb-28 pt-[96px] md:ml-[240px] md:px-10 md:pb-16 lg:px-12">
        <div className="mx-auto max-w-[1200px]">
          {route === "houses" && (
            <HouseListView
              onNavigate={navigate}
              onOpenCreateHouse={() => setIsCreateHouseOpen(true)}
            />
          )}

          {route === "dashboard" && (
            <DashboardView
              onNavigate={navigate}
              onOpenCreateBlock={() => setIsCreateBlockOpen(true)}
            />
          )}

          {route === "relations" && (
            <RelationView onNavigate={navigate} />
          )}

          {route.startsWith("block-") && (() => {
            const blockId = route.replace("block-", "");
            const currentBlock = houseBlocks.find((b) => b.id === blockId);
            if (!currentBlock) {
              return (
                <div className="rounded-2xl border border-dashed border-[#ccdcd9] p-10 text-center">
                  <p className="text-sm text-[#798b88]">El bloque solicitado no fue encontrado.</p>
                  <button
                    onClick={() => navigate("dashboard")}
                    className="mt-3 text-xs font-bold text-[#008d89]"
                  >
                    Volver al Dashboard
                  </button>
                </div>
              );
            }
            return (
              <BlockTableView block={currentBlock} onNavigate={navigate} />
            );
          })()}
        </div>
      </main>

      {/* Modales globales de creación */}
      <CreateHouseModal
        isOpen={isCreateHouseOpen}
        onClose={() => setIsCreateHouseOpen(false)}
        onCreate={(name, desc, color) => {
          createHouse(name, desc, color);
          navigate("dashboard");
        }}
      />

      <CreateBlockModal
        isOpen={isCreateBlockOpen}
        onClose={() => setIsCreateBlockOpen(false)}
        onCreate={(name, desc, icon, fields) => {
          const newB = createBlock(name, desc, icon, fields);
          navigate(`block-${newB.id}`);
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NexoProvider>
        <MainApp />
      </NexoProvider>
    </AuthProvider>
  );
}
