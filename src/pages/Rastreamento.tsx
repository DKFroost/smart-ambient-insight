import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { useDevices } from "@/hooks/useDevices";
import { Search, MapPin, Thermometer, Battery, Truck, Navigation, Signal, Droplets, DoorOpen, DoorClosed } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const MOCK_LOCATIONS: Record<string, { lat: number; lng: number; address: string; lastUpdate: string }> = {
  "Caminhão": { lat: -23.5505, lng: -46.6333, address: "Av. Paulista, 1000 - São Paulo, SP", lastUpdate: "há 2 min" },
  "Caminhão RLK": { lat: -22.9068, lng: -43.1729, address: "Rod. Pres. Dutra, KM 150 - RJ", lastUpdate: "há 1 min" },
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
    return key ? MOCK_LOCATIONS[key] : { lat: -23.55, lng: -46.63, address: "Localização não definida", lastUpdate: "N/A" };
  };

  const getStatusColor = (status: string) => {
    if (status === "online") return "bg-success";
    if (status === "maintenance") return "bg-warning";
    return "bg-destructive";
  };

  const getStatusLabel = (status: string) => {
    if (status === "online") return "Online";
    if (status === "maintenance") return "Manutenção";
    return "Offline";
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar devices={devices ?? []} />
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardHeader devices={devices ?? []} />
        <main className="flex-1 p-6 flex gap-4">
          {/* Painel lateral */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-80 shrink-0 flex flex-col gap-4"
          >
            <div>
              <h1 className="text-xl font-bold text-foreground">Rastreamento</h1>
              <p className="text-sm text-muted-foreground">
                Acompanhe seus caminhões em tempo real.
              </p>
            </div>

            {/* Resumo rápido */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Total", value: trucks.length, color: "bg-sidebar-primary/10 text-sidebar-primary" },
                { label: "Online", value: trucks.filter(t => t.status === "online").length, color: "bg-success/10 text-success" },
              ].map((stat) => (
                <div key={stat.label} className={`rounded-lg p-2.5 text-center ${stat.color}`}>
                  <p className="text-lg font-bold font-mono">{stat.value}</p>
                  <p className="text-[10px] font-medium uppercase">{stat.label}</p>
                </div>
              ))}
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

            <div className="flex-1 space-y-2 overflow-y-auto max-h-[calc(100vh-380px)]">
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
                        ? "bg-sidebar-accent border-sidebar-primary/30 shadow-sm"
                        : "bg-card border-border hover:border-sidebar-primary/20"
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                        isSelected ? "bg-sidebar-primary/20" : "bg-muted"
                      }`}>
                        <Truck className={`w-4 h-4 ${isSelected ? "text-sidebar-primary" : "text-muted-foreground"}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{truck.name}</p>
                        <Badge
                          variant="outline"
                          className={`text-[9px] px-1.5 py-0 h-4 font-medium border-none ${
                            truck.status === "online"
                              ? "bg-success/10 text-success"
                              : truck.status === "maintenance"
                              ? "bg-warning/10 text-warning"
                              : "bg-destructive/10 text-destructive"
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full mr-1 ${getStatusColor(truck.status)}`} />
                          {getStatusLabel(truck.status)}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-muted-foreground mb-2">
                      <MapPin className="w-3 h-3 shrink-0" />
                      <span className="truncate">{loc.address}</span>
                    </div>
                    <div className="flex gap-3 text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Thermometer className="w-3 h-3" /> {truck.temperature}°C
                      </span>
                      <span className="flex items-center gap-1">
                        <Battery className="w-3 h-3" /> {truck.battery}%
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {loc.lastUpdate}
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

              {/* Rotas simuladas entre pontos */}
              <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none">
                <line x1="40%" y1="30%" x2="65%" y2="55%" stroke="hsl(var(--sidebar-primary))" strokeWidth="2" strokeDasharray="8 4" />
                <line x1="65%" y1="55%" x2="25%" y2="45%" stroke="hsl(var(--sidebar-primary))" strokeWidth="2" strokeDasharray="8 4" />
              </svg>

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
                    transition={{ delay: 0.3 + i * 0.1, type: "spring", stiffness: 200 }}
                    className="absolute z-10 cursor-pointer"
                    style={pos}
                    onClick={() => setSelectedId(truck.id)}
                  >
                    <div className={`relative flex flex-col items-center ${isSelected ? "z-20" : "z-10"}`}>
                      <AnimatePresence>
                        {isSelected && (
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.9 }}
                            className="mb-2 px-3 py-2.5 bg-card border border-border rounded-xl shadow-lg whitespace-nowrap"
                          >
                            <p className="text-xs font-semibold text-foreground">{truck.name}</p>
                            <div className="flex gap-3 mt-1 text-[10px] text-muted-foreground">
                              <span>{truck.temperature}°C</span>
                              <span>{truck.humidity}%</span>
                              <span>{truck.battery}%</span>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Pulse ring para online */}
                      {truck.status === "online" && isSelected && (
                        <motion.div
                          className="absolute w-14 h-14 rounded-full border-2 border-sidebar-primary/30"
                          animate={{ scale: [1, 1.5], opacity: [0.6, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        />
                      )}

                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md transition-all ${
                        isSelected
                          ? "bg-sidebar-primary text-sidebar-primary-foreground scale-125"
                          : "bg-card border-2 border-sidebar-primary/50 text-sidebar-primary"
                      }`}>
                        <Truck className="w-4 h-4" />
                      </div>
                      <div className={`w-2 h-2 rounded-full mt-1 ${getStatusColor(truck.status)}`} />
                    </div>
                  </motion.div>
                );
              })}

              {filtered.length === 0 && (
                <div className="text-center z-10">
                  <Navigation className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">Nenhum caminhão para exibir</p>
                </div>
              )}
            </div>

            {/* Info bar inferior */}
            <AnimatePresence>
              {selectedTruck && (
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 40 }}
                  className="absolute bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-border p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-sidebar-primary/10 flex items-center justify-center">
                        <Truck className="w-5 h-5 text-sidebar-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{selectedTruck.name}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {getLocation(selectedTruck.name).address}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-5">
                      {[
                        { label: "Temp", value: `${selectedTruck.temperature}°C`, icon: Thermometer },
                        { label: "Umidade", value: `${selectedTruck.humidity}%`, icon: Droplets },
                        { label: "Bateria", value: `${selectedTruck.battery}%`, icon: Battery },
                        { label: "Porta", value: selectedTruck.door_status === "open" ? "Aberta" : "Fechada", icon: selectedTruck.door_status === "open" ? DoorOpen : DoorClosed },
                        { label: "Velocidade", value: `${getLocation(selectedTruck.name).speed} km/h`, icon: Navigation },
                        { label: "Sinal", value: selectedTruck.signal ?? "N/A", icon: Signal },
                      ].map((item) => (
                        <div key={item.label} className="text-center">
                          <p className="text-[10px] text-muted-foreground uppercase flex items-center justify-center gap-1">
                            <item.icon className="w-3 h-3" /> {item.label}
                          </p>
                          <p className="text-sm font-bold text-foreground font-mono">{item.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default Rastreamento;
