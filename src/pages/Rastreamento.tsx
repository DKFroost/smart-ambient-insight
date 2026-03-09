import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { useDevices } from "@/hooks/useDevices";
import { Search, MapPin, Thermometer, Battery, Truck, Navigation, Signal } from "lucide-react";
import { Input } from "@/components/ui/input";

const MOCK_LOCATIONS: Record<string, { lat: number; lng: number; address: string }> = {
  "Caminhão": { lat: -23.5505, lng: -46.6333, address: "Av. Paulista, 1000 - São Paulo, SP" },
  "Caminhão RLK": { lat: -22.9068, lng: -43.1729, address: "Rod. Pres. Dutra, KM 150 - RJ" },
};

const Rastreamento = () => {
  const { data: devices } = useDevices();
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const trucks = useMemo(() => {
    return (devices ?? []).filter((d) =>
      d.name.toLowerCase().includes("caminhão") || d.name.toLowerCase().includes("caminhao")
    );
  }, [devices]);

  const filtered = useMemo(() => {
    if (!search.trim()) return trucks;
    return trucks.filter((t) =>
      t.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [trucks, search]);

  const selectedTruck = filtered.find((t) => t.id === selectedId) ?? filtered[0] ?? null;

  const getLocation = (name: string) => {
    const key = Object.keys(MOCK_LOCATIONS).find((k) => name.includes(k));
    return key ? MOCK_LOCATIONS[key] : { lat: -23.55, lng: -46.63, address: "Localização não definida" };
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar devices={devices ?? []} />
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardHeader devices={devices ?? []} />
        <main className="flex-1 p-6 flex gap-4">
          {/* Painel lateral de busca */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-80 shrink-0 flex flex-col gap-4"
          >
            <div>
              <h1 className="text-xl font-bold text-foreground">Rastreamento</h1>
              <p className="text-sm text-muted-foreground">Acompanhe seus caminhões em tempo real.</p>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar caminhão..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="flex-1 space-y-2 overflow-y-auto max-h-[calc(100vh-260px)]">
              {filtered.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Nenhum caminhão encontrado.
                </p>
              )}
              {filtered.map((truck) => {
                const loc = getLocation(truck.name);
                const isSelected = selectedTruck?.id === truck.id;
                return (
                  <motion.button
                    key={truck.id}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => setSelectedId(truck.id)}
                    className={`w-full text-left p-4 rounded-xl border transition-all ${
                      isSelected
                        ? "bg-primary/10 border-primary/30"
                        : "bg-card border-border hover:border-primary/20"
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        isSelected ? "bg-primary/20" : "bg-muted"
                      }`}>
                        <Truck className={`w-4 h-4 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{truck.name}</p>
                        <div className="flex items-center gap-1">
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            truck.status === "online" ? "bg-success" : truck.status === "maintenance" ? "bg-warning" : "bg-destructive"
                          }`} />
                          <span className="text-[10px] text-muted-foreground uppercase">{truck.status}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate">{loc.address}</span>
                    </div>
                    <div className="flex gap-3 mt-2 text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Thermometer className="w-3 h-3" /> {truck.temperature}°C
                      </span>
                      <span className="flex items-center gap-1">
                        <Battery className="w-3 h-3" /> {truck.battery}%
                      </span>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>

          {/* Área do mapa */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex-1 rounded-xl border border-border bg-card overflow-hidden relative"
          >
            {/* Placeholder do mapa */}
            <div className="absolute inset-0 bg-muted/30 flex flex-col items-center justify-center">
              {/* Grid simulando mapa */}
              <div className="absolute inset-0 opacity-[0.07]"
                style={{
                  backgroundImage: `
                    linear-gradient(hsl(var(--border)) 1px, transparent 1px),
                    linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)
                  `,
                  backgroundSize: "60px 60px",
                }}
              />

              {/* Marcadores dos caminhões */}
              {filtered.map((truck, i) => {
                const isSelected = selectedTruck?.id === truck.id;
                const positions = [
                  { top: "30%", left: "40%" },
                  { top: "55%", left: "65%" },
                  { top: "45%", left: "25%" },
                  { top: "70%", left: "50%" },
                  { top: "25%", left: "70%" },
                ];
                const pos = positions[i % positions.length];

                return (
                  <motion.div
                    key={truck.id}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="absolute z-10 cursor-pointer"
                    style={pos}
                    onClick={() => setSelectedId(truck.id)}
                  >
                    <div className={`relative flex flex-col items-center ${isSelected ? "z-20" : "z-10"}`}>
                      {isSelected && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mb-2 px-3 py-2 bg-card border border-border rounded-lg shadow-lg whitespace-nowrap"
                        >
                          <p className="text-xs font-semibold text-foreground">{truck.name}</p>
                          <p className="text-[10px] text-muted-foreground">{truck.temperature}°C · {truck.battery}%</p>
                        </motion.div>
                      )}
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md transition-all ${
                        isSelected
                          ? "bg-primary text-primary-foreground scale-125"
                          : "bg-card border-2 border-primary/50 text-primary"
                      }`}>
                        <Truck className="w-4 h-4" />
                      </div>
                      <div className={`w-2 h-2 rounded-full mt-1 ${
                        truck.status === "online" ? "bg-success" : "bg-destructive"
                      }`} />
                    </div>
                  </motion.div>
                );
              })}

              {/* Texto central se não há caminhões */}
              {filtered.length === 0 && (
                <div className="text-center z-10">
                  <Navigation className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">Nenhum caminhão para exibir</p>
                </div>
              )}
            </div>

            {/* Info bar inferior */}
            {selectedTruck && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-border p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Truck className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{selectedTruck.name}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {getLocation(selectedTruck.name).address}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-6">
                    <div className="text-center">
                      <p className="text-[10px] text-muted-foreground uppercase">Temp</p>
                      <p className="text-sm font-bold text-foreground font-mono">{selectedTruck.temperature}°C</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] text-muted-foreground uppercase">Umidade</p>
                      <p className="text-sm font-bold text-foreground font-mono">{selectedTruck.humidity}%</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] text-muted-foreground uppercase">Bateria</p>
                      <p className="text-sm font-bold text-foreground font-mono">{selectedTruck.battery}%</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] text-muted-foreground uppercase">Sinal</p>
                      <p className="text-sm font-bold text-foreground font-mono flex items-center gap-1">
                        <Signal className="w-3 h-3" /> {selectedTruck.signal ?? "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default Rastreamento;
