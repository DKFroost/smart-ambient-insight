import { useState, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { useDevices } from "@/hooks/useDevices";
import {
  Upload,
  Trash2,
  Thermometer,
  Droplets,
  Battery,
  DoorOpen,
  DoorClosed,
  Signal,
  GripVertical,
  ZoomIn,
  ZoomOut,
  Maximize2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface SensorPosition {
  deviceId: string;
  x: number; // percentage
  y: number; // percentage
}

// Each device name IS the group (câmara/sala) — no need for manual sector mapping
function getGroupName(name: string): string {
  return name;
}

// Assign colors dynamically per group
const GROUP_PALETTE = [
  { border: "border-blue-400/40 bg-blue-400/5", label: "text-blue-500" },
  { border: "border-violet-400/40 bg-violet-400/5", label: "text-violet-500" },
  { border: "border-amber-400/40 bg-amber-400/5", label: "text-amber-600" },
  { border: "border-emerald-400/40 bg-emerald-400/5", label: "text-emerald-500" },
  { border: "border-rose-400/40 bg-rose-400/5", label: "text-rose-500" },
  { border: "border-cyan-400/40 bg-cyan-400/5", label: "text-cyan-500" },
  { border: "border-orange-400/40 bg-orange-400/5", label: "text-orange-500" },
  { border: "border-indigo-400/40 bg-indigo-400/5", label: "text-indigo-500" },
  { border: "border-pink-400/40 bg-pink-400/5", label: "text-pink-500" },
  { border: "border-teal-400/40 bg-teal-400/5", label: "text-teal-500" },
  { border: "border-lime-400/40 bg-lime-400/5", label: "text-lime-600" },
];

function getStatusStyle(status: string, anomaly: boolean) {
  if (anomaly) return { ring: "ring-destructive/60", bg: "bg-destructive/15 border-destructive/40", dot: "bg-destructive" };
  if (status === "online") return { ring: "ring-success/50", bg: "bg-success/10 border-success/30", dot: "bg-success" };
  if (status === "maintenance") return { ring: "ring-maintenance/50", bg: "bg-warning/10 border-warning/30", dot: "bg-warning" };
  return { ring: "ring-muted-foreground/30", bg: "bg-muted border-border", dot: "bg-muted-foreground" };
}

const MapaSensores = () => {
  const { data: devices, isLoading } = useDevices();
  const [floorPlanUrl, setFloorPlanUrl] = useState<string | null>(null);
  const [positions, setPositions] = useState<SensorPosition[]>([]);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const mapRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter only non-truck devices (stationary sensors)
  const sensors = useMemo(() => {
    return (devices ?? []).filter(
      (d) => !d.name.toLowerCase().includes("caminhão") && !d.name.toLowerCase().includes("caminhao")
    );
  }, [devices]);

  // Group sensors by device name (each câmara/sala is its own group)
  const sectorGroups = useMemo(() => {
    const groups: Record<string, typeof sensors> = {};
    sensors.forEach((s) => {
      const group = getGroupName(s.name);
      if (!groups[group]) groups[group] = [];
      groups[group].push(s);
    });
    return groups;
  }, [sensors]);

  // Merge manual positions with auto-generated ones for sensors without a position
  const effectivePositions = useMemo(() => {
    const cols = Math.ceil(Math.sqrt(sensors.length));
    return sensors.map((s, i) => {
      const manual = positions.find((p) => p.deviceId === s.id);
      if (manual) return manual;
      return {
        deviceId: s.id,
        x: 15 + (i % cols) * (70 / Math.max(cols, 1)),
        y: 15 + Math.floor(i / cols) * (70 / Math.max(Math.ceil(sensors.length / cols), 1)),
      };
    });
  }, [sensors, positions]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setFloorPlanUrl(url);
  };

  const handleRemoveFloorPlan = () => {
    setFloorPlanUrl(null);
  };

  const handleDragStart = (deviceId: string) => {
    setDraggingId(deviceId);
  };

  const handleDrag = (e: React.MouseEvent | React.TouchEvent, deviceId: string) => {
    if (draggingId !== deviceId || !mapRef.current) return;

    const rect = mapRef.current.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    const x = Math.max(2, Math.min(98, ((clientX - rect.left) / rect.width) * 100));
    const y = Math.max(2, Math.min(98, ((clientY - rect.top) / rect.height) * 100));

    setPositions((prev) => {
      const existing = prev.filter((p) => p.deviceId !== deviceId);
      return [...existing, { deviceId, x, y }];
    });
  };

  const handleDragEnd = () => {
    setDraggingId(null);
  };

  const hoveredDevice = sensors.find((s) => s.id === hoveredId);
  const hoveredPos = effectivePositions.find((p) => p.deviceId === hoveredId);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar devices={devices ?? []} />
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardHeader devices={devices ?? []} />

        <main className="flex-1 p-6">
          {/* Page Title */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl font-bold text-foreground">Mapa de Sensores</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                {floorPlanUrl
                  ? "Arraste os ícones para reposicionar. Passe o mouse no ícone para ver informações."
                  : "Faça upload de uma planta baixa para posicionar os sensores."}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="gap-2"
              >
                <Upload className="w-4 h-4" />
                {floorPlanUrl ? "Alterar planta" : "Upload planta"}
              </Button>
              {floorPlanUrl && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveFloorPlan}
                  className="gap-2 text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                  Remover planta
                </Button>
              )}
            </div>
          </div>

          <div className="flex gap-6">
            {/* Sector legend sidebar */}
            <div className="w-52 shrink-0 space-y-4">
              <h3 className="text-xs font-semibold text-muted-foreground tracking-widest uppercase">
                Setores
              </h3>
              {Object.entries(sectorGroups).map(([group, groupDevices], idx) => {
                const onlineCount = groupDevices.filter((d) => d.status === "online").length;
                const alertCount = groupDevices.filter((d) => d.anomaly).length;
                const palette = GROUP_PALETTE[idx % GROUP_PALETTE.length];
                return (
                  <div
                    key={group}
                    className={`p-3 rounded-lg border ${palette.border}`}
                  >
                    <p className={`text-xs font-semibold ${palette.label}`}>
                      {group}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {onlineCount}/{groupDevices.length} online
                    </p>
                    {alertCount > 0 && (
                      <Badge variant="destructive" className="mt-1.5 text-[9px] h-4 px-1.5">
                        {alertCount} alerta{alertCount > 1 ? "s" : ""}
                      </Badge>
                    )}
                  </div>
                );
              })}

              {/* Zoom controls */}
              <div className="pt-4 border-t border-border space-y-2">
                <p className="text-[10px] font-semibold text-muted-foreground tracking-widest uppercase">Zoom</p>
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="icon" className="w-7 h-7" onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))}>
                    <ZoomOut className="w-3 h-3" />
                  </Button>
                  <span className="text-xs text-muted-foreground w-12 text-center">{Math.round(zoom * 100)}%</span>
                  <Button variant="outline" size="icon" className="w-7 h-7" onClick={() => setZoom((z) => Math.min(2, z + 0.1))}>
                    <ZoomIn className="w-3 h-3" />
                  </Button>
                  <Button variant="outline" size="icon" className="w-7 h-7" onClick={() => setZoom(1)}>
                    <Maximize2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Map area */}
            <div className="flex-1 rounded-xl border border-border bg-card overflow-hidden">
              {isLoading ? (
                <Skeleton className="w-full h-[600px]" />
              ) : (
                <div
                  className="relative w-full overflow-auto"
                  style={{ height: "calc(100vh - 220px)" }}
                >
                  <div
                    ref={mapRef}
                    className="relative w-full h-full"
                    style={{
                      transform: `scale(${zoom})`,
                      transformOrigin: "top left",
                      minWidth: "100%",
                      minHeight: "100%",
                    }}
                    onMouseMove={(e) => draggingId && handleDrag(e, draggingId)}
                    onMouseUp={handleDragEnd}
                    onMouseLeave={handleDragEnd}
                  >
                    {/* Floor plan or grid background */}
                    {floorPlanUrl ? (
                      <img
                        src={floorPlanUrl}
                        alt="Planta baixa"
                        className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
                        draggable={false}
                      />
                    ) : (
                      <div
                        className="absolute inset-0 opacity-[0.06]"
                        style={{
                          backgroundImage: `
                            linear-gradient(hsl(var(--border)) 1px, transparent 1px),
                            linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)
                          `,
                          backgroundSize: "40px 40px",
                        }}
                      />
                    )}

                    {/* Sensor markers */}
                    {sensors.map((sensor) => {
                      const pos = effectivePositions.find((p) => p.deviceId === sensor.id);
                      if (!pos) return null;

                      const style = getStatusStyle(sensor.status, sensor.anomaly);
                      const isHovered = hoveredId === sensor.id;
                      const isDragging = draggingId === sensor.id;

                      return (
                        <motion.div
                          key={sensor.id}
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ type: "spring", stiffness: 300, damping: 20 }}
                          className={`absolute z-10 cursor-grab ${isDragging ? "cursor-grabbing z-30" : ""}`}
                          style={{
                            left: `${pos.x}%`,
                            top: `${pos.y}%`,
                            transform: "translate(-50%, -50%)",
                          }}
                          onMouseEnter={() => setHoveredId(sensor.id)}
                          onMouseLeave={() => !isDragging && setHoveredId(null)}
                          onMouseDown={() => handleDragStart(sensor.id)}
                        >
                          <div className="relative flex flex-col items-center">
                            {/* Pulse for online + anomaly */}
                            {(sensor.status === "online" || sensor.anomaly) && (
                              <motion.div
                                className={`absolute w-12 h-12 rounded-full ring-2 ${style.ring}`}
                                style={{ top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}
                                animate={{ scale: [1, 1.4], opacity: [0.5, 0] }}
                                transition={{ duration: sensor.anomaly ? 0.8 : 2, repeat: Infinity }}
                              />
                            )}

                            {/* Sensor icon */}
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center border-2 shadow-md transition-all ${style.bg} ${
                                isHovered ? "scale-125 shadow-lg" : ""
                              }`}
                            >
                              <Thermometer className={`w-4 h-4 ${sensor.anomaly ? "text-destructive" : sensor.status === "online" ? "text-success" : "text-muted-foreground"}`} />
                            </div>

                            {/* Label below */}
                            <span className="mt-1 text-[9px] font-medium text-foreground/70 bg-card/80 px-1.5 py-0.5 rounded whitespace-nowrap max-w-[100px] truncate backdrop-blur-sm">
                              {sensor.name.length > 18 ? sensor.name.slice(0, 18) + "…" : sensor.name}
                            </span>
                          </div>
                        </motion.div>
                      );
                    })}

                    {/* Tooltip on hover */}
                    <AnimatePresence>
                      {hoveredDevice && hoveredPos && !draggingId && (
                        <motion.div
                          initial={{ opacity: 0, y: 8, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className="absolute z-50 pointer-events-none"
                          style={{
                            left: `${hoveredPos.x}%`,
                            top: `${hoveredPos.y - 2}%`,
                            transform: "translate(-50%, -100%)",
                          }}
                        >
                          <div className="bg-card border border-border rounded-xl shadow-xl p-3 min-w-[200px]">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-xs font-bold text-foreground">{hoveredDevice.name}</p>
                              <Badge
                                variant="outline"
                                className={`text-[9px] px-1.5 py-0 h-4 font-medium border-none ${
                                  hoveredDevice.status === "online"
                                    ? "bg-success/10 text-success"
                                    : hoveredDevice.status === "maintenance"
                                    ? "bg-warning/10 text-warning"
                                    : "bg-muted text-muted-foreground"
                                }`}
                              >
                                {hoveredDevice.status === "online" ? "Online" : hoveredDevice.status === "maintenance" ? "Manutenção" : "Offline"}
                              </Badge>
                            </div>
                            <div className="text-[10px] text-muted-foreground mb-2">
                              Setor: <span className="text-foreground font-medium">{getSector(hoveredDevice.name)}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div className="flex items-center gap-1.5 text-[10px]">
                                <Thermometer className="w-3 h-3 text-destructive/70" />
                                <span className="text-muted-foreground">Temp</span>
                                <span className="font-semibold text-foreground ml-auto">{hoveredDevice.temperature}°C</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-[10px]">
                                <Droplets className="w-3 h-3 text-blue-400" />
                                <span className="text-muted-foreground">Umid</span>
                                <span className="font-semibold text-foreground ml-auto">{hoveredDevice.humidity}%</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-[10px]">
                                <Battery className="w-3 h-3 text-success/70" />
                                <span className="text-muted-foreground">Bat</span>
                                <span className="font-semibold text-foreground ml-auto">{hoveredDevice.battery}%</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-[10px]">
                                {hoveredDevice.door_status === "open" ? (
                                  <DoorOpen className="w-3 h-3 text-warning" />
                                ) : (
                                  <DoorClosed className="w-3 h-3 text-success/70" />
                                )}
                                <span className="text-muted-foreground">Porta</span>
                                <span className="font-semibold text-foreground ml-auto">
                                  {hoveredDevice.door_status === "open" ? "Aberta" : "Fechada"}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5 text-[10px] col-span-2">
                                <Signal className="w-3 h-3 text-sidebar-primary" />
                                <span className="text-muted-foreground">Sinal</span>
                                <span className="font-semibold text-foreground ml-auto">{hoveredDevice.signal ?? "N/A"}</span>
                              </div>
                            </div>
                            {hoveredDevice.anomaly && hoveredDevice.ai_insight && (
                              <div className="mt-2 pt-2 border-t border-border">
                                <p className="text-[9px] text-destructive font-medium">⚠ {hoveredDevice.ai_insight}</p>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Empty state */}
                    {sensors.length === 0 && !isLoading && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <GripVertical className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
                          <p className="text-sm text-muted-foreground">Nenhum sensor encontrado</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MapaSensores;
