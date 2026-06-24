import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { useDevices } from "@/hooks/useDevices";
import {
  Search, MapPin, Thermometer, Battery, Truck, Navigation, Signal,
  Droplets, DoorOpen, DoorClosed, Gauge, Clock, Route as RouteIcon,
  Plus, Minus, Crosshair, Activity, AlertTriangle, FlaskConical,
  CheckCircle2, BatteryLow, TimerOff
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Device } from "@/hooks/useDevices";

type ScenarioId = "normal" | "temp" | "battery" | "delay";

const SCENARIOS: {
  id: ScenarioId;
  label: string;
  description: string;
  icon: typeof CheckCircle2;
  accent: string;
}[] = [
  { id: "normal",  label: "Normal",            description: "Operação dentro dos parâmetros",       icon: CheckCircle2, accent: "text-success border-success/40 bg-success/10" },
  { id: "temp",    label: "Anomalia de temp.", description: "Temperaturas acima do limite seguro",  icon: Thermometer,  accent: "text-destructive border-destructive/40 bg-destructive/10" },
  { id: "battery", label: "Bateria baixa",     description: "Veículos com bateria crítica",         icon: BatteryLow,   accent: "text-warning border-warning/40 bg-warning/10" },
  { id: "delay",   label: "Rota atrasada",     description: "Movimento lento + porta aberta",       icon: TimerOff,     accent: "text-info border-info/40 bg-info/10" },
];

// Applies a test-scenario overlay on top of the real device data (display-only).
function applyScenario(truck: Device, i: number, scenario: ScenarioId): Device {
  if (scenario === "normal") return truck;
  const seedA = (i * 37) % 100;
  const seedB = (i * 53) % 100;
  if (scenario === "temp") {
    return {
      ...truck,
      temperature: Number((8 + (seedA / 100) * 6).toFixed(1)), // 8°C – 14°C
      anomaly: true,
      ai_insight: "Temperatura acima do limite seguro detectada. Verificar sistema de refrigeração imediatamente.",
    };
  }
  if (scenario === "battery") {
    return {
      ...truck,
      battery: Math.max(4, Math.round(5 + (seedB / 100) * 15)), // 5% – 20%
      anomaly: true,
      ai_insight: "Bateria em nível crítico. Encaminhar para recarga antes da próxima rota.",
    };
  }
  // delay
  return {
    ...truck,
    door_status: i % 2 === 0 ? "open" : truck.door_status,
    anomaly: true,
    ai_insight: "Rota atrasada — veículo abaixo da velocidade esperada e parada prolongada detectada.",
  };
}

// Simulated route waypoints (% of map area) for each truck. The truck animates along these.
const ROUTES: Record<string, { points: { x: number; y: number }[]; address: string; destination: string }> = {
  default: {
    points: [
      { x: 15, y: 75 }, { x: 28, y: 60 }, { x: 40, y: 55 },
      { x: 52, y: 42 }, { x: 65, y: 35 }, { x: 78, y: 22 },
    ],
    address: "Av. Paulista, 1000 - São Paulo, SP",
    destination: "Centro de Distribuição - Campinas, SP",
  },
  alt: {
    points: [
      { x: 20, y: 25 }, { x: 35, y: 30 }, { x: 48, y: 48 },
      { x: 60, y: 55 }, { x: 72, y: 68 }, { x: 85, y: 75 },
    ],
    address: "Rod. Pres. Dutra, KM 150 - RJ",
    destination: "Porto de Santos - Santos, SP",
  },
};

function getRoute(index: number) {
  return index % 2 === 0 ? ROUTES.default : ROUTES.alt;
}

// Quadratic-bezier-ish interpolation along the polyline
function pointOnRoute(points: { x: number; y: number }[], t: number) {
  if (points.length < 2) return points[0] ?? { x: 50, y: 50 };
  const clamped = Math.max(0, Math.min(0.9999, t));
  const seg = clamped * (points.length - 1);
  const i = Math.floor(seg);
  const f = seg - i;
  const a = points[i];
  const b = points[i + 1];
  return { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f };
}

const Rastreamento = () => {
  const { data: devices } = useDevices();
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [scenario, setScenario] = useState<ScenarioId>("normal");

  const rawTrucks = useMemo(() => {
    return (devices ?? []).filter((d) =>
      d.name.toLowerCase().includes("caminhão") || d.name.toLowerCase().includes("caminhao")
    );
  }, [devices]);

  // Apply current test-scenario overlay to every truck
  const trucks = useMemo(
    () => rawTrucks.map((t, i) => applyScenario(t, i, scenario)),
    [rawTrucks, scenario]
  );

  const filtered = useMemo(() => {
    if (!search.trim()) return trucks;
    return trucks.filter((t) => t.name.toLowerCase().includes(search.toLowerCase()));
  }, [trucks, search]);

  const selectedTruck = filtered.find((t) => t.id === selectedId) ?? null;

  // Animate trucks along their routes — speed depends on scenario
  useEffect(() => {
    if (trucks.length === 0) return;
    const speed = scenario === "delay" ? 0.0009 : 0.0035;
    const interval = setInterval(() => {
      setProgress((prev) => {
        const next: Record<string, number> = { ...prev };
        trucks.forEach((t, i) => {
          const seed = (i + 1) * 0.13;
          const current = next[t.id] ?? seed;
          next[t.id] = current >= 0.98 ? 0 : current + speed;
        });
        return next;
      });
    }, 80);
    return () => clearInterval(interval);
  }, [trucks, scenario]);

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

  // Focus offset based on selected truck position so the map "pans" to it
  const truckIndex = (id: string) => trucks.findIndex((t) => t.id === id);
  const selectedPos = selectedTruck
    ? pointOnRoute(getRoute(truckIndex(selectedTruck.id)).points, progress[selectedTruck.id] ?? 0)
    : null;

  const panX = selectedPos ? (50 - selectedPos.x) * (zoom > 1 ? 1 : 0) : 0;
  const panY = selectedPos ? (50 - selectedPos.y) * (zoom > 1 ? 1 : 0) : 0;

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
                Clique em um caminhão para focar no mapa.
              </p>
            </div>

            {/* Menu de cenários de teste */}
            <div className="rounded-xl border border-border bg-card p-3">
              <div className="flex items-center gap-2 mb-2.5">
                <FlaskConical className="w-3.5 h-3.5 text-sidebar-primary" />
                <span className="text-[11px] font-semibold uppercase tracking-wide text-foreground">
                  Cenário de teste
                </span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {SCENARIOS.map((s) => {
                  const Icon = s.icon;
                  const active = scenario === s.id;
                  return (
                    <button
                      key={s.id}
                      onClick={() => setScenario(s.id)}
                      title={s.description}
                      className={`flex items-center gap-1.5 rounded-lg border px-2 py-1.5 text-left transition-all ${
                        active
                          ? s.accent + " font-semibold shadow-sm"
                          : "border-border bg-muted/30 text-muted-foreground hover:bg-muted/60"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      <span className="text-[10.5px] leading-tight">{s.label}</span>
                    </button>
                  );
                })}
              </div>
              <p className="mt-2 text-[10px] text-muted-foreground leading-snug">
                {SCENARIOS.find((s) => s.id === scenario)?.description}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Total", value: trucks.length, color: "bg-sidebar-primary/10 text-sidebar-primary" },
                { label: "Online", value: trucks.filter((t) => t.status === "online").length, color: "bg-success/10 text-success" },
                { label: "Alertas", value: trucks.filter((t) => t.anomaly).length, color: "bg-warning/10 text-warning" },
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

            <div className="flex-1 space-y-2 overflow-y-auto max-h-[calc(100vh-380px)] pr-1">
              {filtered.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Nenhum caminhão encontrado.
                </p>
              )}
              {filtered.map((truck, i) => {
                const route = getRoute(i);
                const isSelected = selectedTruck?.id === truck.id;
                const p = progress[truck.id] ?? 0;
                return (
                  <motion.button
                    key={truck.id}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => {
                      setSelectedId(truck.id);
                      setZoom(1.6);
                    }}
                    className={`w-full text-left p-4 rounded-xl border transition-all ${
                      isSelected
                        ? "bg-sidebar-accent border-sidebar-primary/40 shadow-md ring-1 ring-sidebar-primary/20"
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
                      <span className="truncate">{route.address}</span>
                    </div>
                    {/* progresso da rota */}
                    <div className="h-1 w-full bg-muted rounded-full overflow-hidden mb-2">
                      <div
                        className="h-full bg-sidebar-primary transition-all"
                        style={{ width: `${Math.round(p * 100)}%` }}
                      />
                    </div>
                    <div className="flex gap-3 text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Thermometer className="w-3 h-3" /> {truck.temperature}°C
                      </span>
                      <span className="flex items-center gap-1">
                        <Battery className="w-3 h-3" /> {truck.battery}%
                      </span>
                      <span className="flex items-center gap-1">
                        <RouteIcon className="w-3 h-3" /> {Math.round(p * 100)}%
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
            {/* Controles de zoom */}
            <div className="absolute top-4 right-4 z-30 flex flex-col gap-1 bg-card/95 backdrop-blur-sm border border-border rounded-lg p-1 shadow-md">
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                onClick={() => setZoom((z) => Math.min(2.5, z + 0.25))}
              >
                <Plus className="w-4 h-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                onClick={() => setZoom((z) => Math.max(1, z - 0.25))}
              >
                <Minus className="w-4 h-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                onClick={() => {
                  setZoom(1);
                  setSelectedId(null);
                }}
              >
                <Crosshair className="w-4 h-4" />
              </Button>
            </div>

            {/* Indicador live */}
            <div className="absolute top-4 left-4 z-30 flex items-center gap-2 bg-card/95 backdrop-blur-sm border border-border rounded-full px-3 py-1.5 shadow-md">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
              </span>
              <span className="text-xs font-medium text-foreground">Ao vivo</span>
              <span className="text-xs text-muted-foreground">• {filtered.length} veículos</span>
            </div>

            <motion.div
              className="absolute inset-0 bg-muted/30"
              animate={{ scale: zoom, x: `${panX}%`, y: `${panY}%` }}
              transition={{ type: "spring", stiffness: 80, damping: 18 }}
              style={{ transformOrigin: "center center" }}
            >
              {/* Grid simulando mapa */}
              <div
                className="absolute inset-0 opacity-[0.08]"
                style={{
                  backgroundImage: `
                    linear-gradient(hsl(var(--border)) 1px, transparent 1px),
                    linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)
                  `,
                  backgroundSize: "60px 60px",
                }}
              />

              {/* Áreas / regiões */}
              <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                <defs>
                  <radialGradient id="region1" cx="30%" cy="40%" r="30%">
                    <stop offset="0%" stopColor="hsl(var(--sidebar-primary))" stopOpacity="0.08" />
                    <stop offset="100%" stopColor="hsl(var(--sidebar-primary))" stopOpacity="0" />
                  </radialGradient>
                  <radialGradient id="region2" cx="70%" cy="60%" r="35%">
                    <stop offset="0%" stopColor="hsl(var(--success))" stopOpacity="0.08" />
                    <stop offset="100%" stopColor="hsl(var(--success))" stopOpacity="0" />
                  </radialGradient>
                </defs>
                <rect width="100" height="100" fill="url(#region1)" />
                <rect width="100" height="100" fill="url(#region2)" />

                {/* "Estradas" base */}
                <path d="M 0 70 Q 30 65 50 50 T 100 30" stroke="hsl(var(--border))" strokeWidth="0.6" fill="none" opacity="0.5" />
                <path d="M 0 25 Q 35 30 55 50 T 100 75" stroke="hsl(var(--border))" strokeWidth="0.6" fill="none" opacity="0.5" />

                {/* Rotas dos caminhões */}
                {filtered.map((truck, i) => {
                  const route = getRoute(i);
                  const isSelected = selectedTruck?.id === truck.id;
                  const d = route.points
                    .map((p, idx) => `${idx === 0 ? "M" : "L"} ${p.x} ${p.y}`)
                    .join(" ");
                  return (
                    <g key={truck.id}>
                      <path
                        d={d}
                        stroke="hsl(var(--sidebar-primary))"
                        strokeWidth={isSelected ? "0.6" : "0.3"}
                        strokeDasharray="1.5 1"
                        fill="none"
                        opacity={isSelected ? 0.9 : 0.35}
                      />
                      {/* origem */}
                      <circle
                        cx={route.points[0].x}
                        cy={route.points[0].y}
                        r={isSelected ? "0.9" : "0.6"}
                        fill="hsl(var(--success))"
                      />
                      {/* destino */}
                      <circle
                        cx={route.points[route.points.length - 1].x}
                        cy={route.points[route.points.length - 1].y}
                        r={isSelected ? "0.9" : "0.6"}
                        fill="hsl(var(--destructive))"
                      />
                    </g>
                  );
                })}
              </svg>

              {/* Marcadores dos caminhões (animados na rota) */}
              {filtered.map((truck, i) => {
                const route = getRoute(i);
                const p = progress[truck.id] ?? 0;
                const pos = pointOnRoute(route.points, p);
                const isSelected = selectedTruck?.id === truck.id;

                return (
                  <motion.div
                    key={truck.id}
                    className="absolute z-10 cursor-pointer"
                    style={{ top: `${pos.y}%`, left: `${pos.x}%`, transform: "translate(-50%, -50%)" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedId(truck.id);
                      setZoom(1.6);
                    }}
                    whileHover={{ scale: 1.1 }}
                  >
                    <div className={`relative flex flex-col items-center ${isSelected ? "z-20" : "z-10"}`}>
                      <div className="relative">
                        {truck.status === "online" && (
                          <motion.div
                            className="absolute w-12 h-12 rounded-full border-2 border-sidebar-primary/40 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                            animate={{ scale: [1, 1.8], opacity: [0.6, 0] }}
                            transition={{ duration: 1.8, repeat: Infinity }}
                          />
                        )}
                        {truck.anomaly && (
                          <motion.div
                            className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-warning border-2 border-card z-30"
                            animate={{ scale: [1, 1.3, 1] }}
                            transition={{ duration: 1, repeat: Infinity }}
                          />
                        )}
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md transition-all ${
                          isSelected
                            ? "bg-sidebar-primary text-sidebar-primary-foreground scale-125"
                            : "bg-card border-2 border-sidebar-primary/50 text-sidebar-primary"
                        }`}>
                          <Truck className="w-4 h-4" />
                        </div>
                      </div>
                      <div className={`w-2 h-2 rounded-full mt-1 ${getStatusColor(truck.status)}`} />
                    </div>
                  </motion.div>
                );
              })}

              {filtered.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <Navigation className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">Nenhum caminhão para exibir</p>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Painel detalhado do caminhão selecionado */}
            <AnimatePresence>
              {selectedTruck && (
                <motion.div
                  key={selectedTruck.id}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 40 }}
                  transition={{ type: "spring", stiffness: 200, damping: 24 }}
                  className="absolute bottom-4 left-4 right-4 z-30 bg-card/95 backdrop-blur-md border border-border rounded-xl shadow-xl overflow-hidden"
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-sidebar-primary/10 flex items-center justify-center">
                          <Truck className="w-6 h-6 text-sidebar-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-base font-bold text-foreground">{selectedTruck.name}</p>
                            <Badge
                              variant="outline"
                              className={`text-[10px] px-2 py-0 h-5 border-none ${
                                selectedTruck.status === "online"
                                  ? "bg-success/10 text-success"
                                  : selectedTruck.status === "maintenance"
                                  ? "bg-warning/10 text-warning"
                                  : "bg-destructive/10 text-destructive"
                              }`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full mr-1 ${getStatusColor(selectedTruck.status)}`} />
                              {getStatusLabel(selectedTruck.status)}
                            </Badge>
                            {selectedTruck.anomaly && (
                              <Badge className="bg-warning/10 text-warning border-none text-[10px] h-5">
                                <AlertTriangle className="w-3 h-3 mr-1" /> Anomalia
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {getRoute(truckIndex(selectedTruck.id)).address}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" /> há poucos segundos
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Progresso da rota */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <RouteIcon className="w-3 h-3" /> Rota
                        </span>
                        <span className="font-mono text-foreground">
                          {Math.round((progress[selectedTruck.id] ?? 0) * 100)}%
                        </span>
                      </div>
                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden relative">
                        <motion.div
                          className="h-full bg-gradient-to-r from-sidebar-primary to-sidebar-primary/70"
                          animate={{ width: `${Math.round((progress[selectedTruck.id] ?? 0) * 100)}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                        <span>{getRoute(truckIndex(selectedTruck.id)).address}</span>
                        <span>{getRoute(truckIndex(selectedTruck.id)).destination}</span>
                      </div>
                    </div>

                    {/* Telemetria */}
                    <div className="grid grid-cols-5 gap-3">
                      {[
                        { label: "Temperatura", value: `${selectedTruck.temperature}°C`, icon: Thermometer, color: "text-sidebar-primary" },
                        { label: "Umidade", value: `${selectedTruck.humidity}%`, icon: Droplets, color: "text-info" },
                        { label: "Bateria", value: `${selectedTruck.battery}%`, icon: Battery, color: "text-success" },
                        {
                          label: "Porta",
                          value: selectedTruck.door_status === "open" ? "Aberta" : "Fechada",
                          icon: selectedTruck.door_status === "open" ? DoorOpen : DoorClosed,
                          color: selectedTruck.door_status === "open" ? "text-warning" : "text-muted-foreground",
                        },
                        { label: "Sinal", value: selectedTruck.signal ?? "N/A", icon: Signal, color: "text-muted-foreground" },
                      ].map((item) => (
                        <div key={item.label} className="bg-muted/40 rounded-lg p-2.5">
                          <p className="text-[10px] text-muted-foreground uppercase flex items-center gap-1 mb-1">
                            <item.icon className={`w-3 h-3 ${item.color}`} /> {item.label}
                          </p>
                          <p className="text-sm font-bold text-foreground font-mono">{item.value}</p>
                        </div>
                      ))}
                    </div>

                    {selectedTruck.ai_insight && (
                      <div className="mt-3 p-2.5 bg-sidebar-primary/5 border border-sidebar-primary/20 rounded-lg flex items-start gap-2">
                        <Activity className="w-3.5 h-3.5 text-sidebar-primary shrink-0 mt-0.5" />
                        <p className="text-xs text-foreground">{selectedTruck.ai_insight}</p>
                      </div>
                    )}
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
