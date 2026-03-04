import { motion } from "framer-motion";
import { Thermometer, Droplets, Battery, Lock, LockOpen, Brain, AlertTriangle } from "lucide-react";
import type { Device } from "@/data/devices";

const statusConfig = {
  online: { label: "ONLINE", className: "bg-success/15 text-success border-success/20" },
  maintenance: { label: "MANUTENÇÃO", className: "bg-warning/15 text-warning border-warning/20" },
  offline: { label: "OFFLINE", className: "bg-destructive/15 text-destructive border-destructive/20" },
};

interface DeviceCardProps {
  device: Device;
  index: number;
}

export function DeviceCard({ device, index }: DeviceCardProps) {
  const status = statusConfig[device.status];
  const isNegative = device.temperature < 0;
  const isCritical = device.anomaly;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className={`card-sensor group relative overflow-hidden ${
        isCritical ? "border-warning/30" : ""
      }`}
    >
      {/* AI glow effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground leading-tight pr-2 max-w-[70%]">
          {device.name}
        </h3>
        <span className={`text-[10px] font-bold tracking-wider px-2.5 py-1 rounded-full border shrink-0 ${status.className}`}>
          {status.label}
        </span>
      </div>

      {/* Temperature */}
      <div className="flex items-baseline gap-1.5 mb-4">
        <Thermometer className={`w-4 h-4 shrink-0 ${isCritical ? "text-warning" : "text-primary"}`} />
        <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">Temp</span>
        <span className={`text-3xl font-bold font-mono tracking-tighter ml-1 ${
          isCritical ? "text-warning" : "text-foreground"
        }`}>
          {device.temperature.toFixed(2)}°C
        </span>
      </div>

      {/* AI Insight */}
      {device.aiInsight && (
        <div className={`flex items-start gap-1.5 mb-4 p-2 rounded-md text-[11px] ${
          isCritical
            ? "bg-warning/5 text-warning/80 border border-warning/10"
            : "bg-primary/5 text-primary/70 border border-primary/10"
        }`}>
          {isCritical ? (
            <AlertTriangle className="w-3 h-3 shrink-0 mt-0.5" />
          ) : (
            <Brain className="w-3 h-3 shrink-0 mt-0.5" />
          )}
          <span className="leading-tight">{device.aiInsight}</span>
        </div>
      )}

      {/* Footer metrics */}
      <div className="flex items-center gap-3 text-[11px] text-muted-foreground flex-wrap">
        <span className="flex items-center gap-1">
          <Droplets className="w-3 h-3" />
          {device.humidity}%
        </span>
        <span className="flex items-center gap-1">
          <Battery className="w-3 h-3" />
          {device.battery}%
        </span>
        <span className="font-mono text-[10px]">{device.signal}</span>
        <span className={`ml-auto flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
          device.doorStatus === "closed"
            ? "bg-success/10 text-success"
            : "bg-destructive/10 text-destructive"
        }`}>
          {device.doorStatus === "closed" ? (
            <Lock className="w-3 h-3" />
          ) : (
            <LockOpen className="w-3 h-3" />
          )}
          {device.doorStatus === "closed" ? "Fechada" : "Aberta"}
        </span>
      </div>
    </motion.div>
  );
}
