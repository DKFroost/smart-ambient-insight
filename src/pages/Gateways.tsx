import { Sidebar } from "@/components/dashboard/Sidebar";
import { useDevices } from "@/hooks/useDevices";
import { useNavigate } from "react-router-dom";
import { Monitor } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

// Mock gateway data
const gatewaysData = [
  {
    id: "gw1",
    mac: "28:2C:02:22:A1:72",
    devices: ["Caminhão RLK-1160"],
  },
  {
    id: "gw2",
    mac: "BC:57:29:1E:2D:A5",
    devices: [
      "Câmara Fria Receios/Materia Prima",
      "Câmara Ultra Congelamento 01",
      "Câmara Ultra Congelamento 02",
      "Câmara Ultra Congelamento 03",
      "Câmara Ultra Congelamento 04",
      "Câmara Ultra Congelamento 05",
      "Câmara Ultra Congelamento 06",
      "Câmara Ultra Congelamento 07",
      "Sala De Expedição 08",
      "Sala Principal, Porta Grande",
    ],
  },
];

const Gateways = () => {
  const { data: devices } = useDevices();
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar devices={devices ?? []} />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-card/50 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <button onClick={() => navigate("/")} className="text-foreground font-semibold hover:underline">Alcate-IA</button>
            <span className="text-border">&gt;</span>
            <span>Gateways</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Online ({(devices ?? []).filter(d => d.status === "online").length}/{(devices ?? []).length})</span>
          </div>
        </header>

        <main className="flex-1 p-6">
          <div className="mb-6">
            <h1 className="text-xl font-bold text-foreground">Gateways</h1>
            <p className="text-sm text-muted-foreground">Visualize os gateways e seus dispositivos vinculados.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {gatewaysData.map((gw) => (
              <div key={gw.id} className="bg-card border border-border rounded-xl p-5 relative">
                <div className="flex items-center gap-2 mb-4">
                  <Monitor className="w-4 h-4 text-muted-foreground" />
                  <span className="font-mono text-sm font-semibold text-foreground">{gw.mac}</span>
                  <span className="ml-auto bg-primary text-primary-foreground text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {gw.devices.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {gw.devices.map((name, i) => (
                    <div key={i} className="text-sm text-muted-foreground">
                      <span className="text-foreground font-medium">{name}</span>
                      <p className="text-xs font-mono text-muted-foreground">BC:57:29:{String(i + 30).padStart(2, "0")}:{String(i * 7 + 50).slice(0, 2)}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Gateways;
