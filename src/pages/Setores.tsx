import { Sidebar } from "@/components/dashboard/Sidebar";
import { useDevices } from "@/hooks/useDevices";
import { useNavigate } from "react-router-dom";
import { Pencil, Trash2, Plus } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useState } from "react";

const initialSectors = [
  { id: "s1", name: "Câmara Fria A", sensors: 0, online: 0 },
  { id: "s2", name: "Transporte 01", sensors: 0, online: 0 },
];

const Setores = () => {
  const { data: devices } = useDevices();
  const navigate = useNavigate();
  const [sectors] = useState(initialSectors);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar devices={devices ?? []} />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-card/50 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <button onClick={() => navigate("/")} className="text-foreground font-semibold hover:underline">Alcate-IA</button>
            <span className="text-border">&gt;</span>
            <span>Configuração</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Online ({(devices ?? []).filter(d => d.status === "online").length}/{(devices ?? []).length})</span>
          </div>
        </header>

        <main className="flex-1 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl font-bold text-foreground">Setores</h1>
              <p className="text-sm text-muted-foreground">Gerencie a distribuição dos sensores.</p>
            </div>
            <button className="flex items-center gap-1.5 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
              <Plus className="w-4 h-4" />
              Novo
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sectors.map((sector) => (
              <div key={sector.id} className="bg-card border border-border rounded-xl p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-foreground">{sector.name}</h3>
                    <p className="text-xs text-muted-foreground">Último: -</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 rounded-md hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex gap-6 mb-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Sensores</p>
                    <p className="text-lg font-bold text-foreground">{sector.sensors}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Online</p>
                    <p className="text-lg font-bold text-foreground">{sector.online}</p>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground mb-3">Vazio</p>

                <div className="flex items-center gap-2">
                  <select className="flex-1 text-sm border border-border rounded-lg px-3 py-2 bg-background text-muted-foreground">
                    <option>Selecionar sensores online</option>
                    {(devices ?? []).filter(d => d.status === "online").map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                  <button className="w-9 h-9 flex items-center justify-center rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-[10px] text-muted-foreground mt-2">Também é possível editar o setor para selecionar múltiplos sensores.</p>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Setores;
