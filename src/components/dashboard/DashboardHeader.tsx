import { Wifi, Brain, Sparkles } from "lucide-react";
import type { Device } from "@/hooks/useDevices";
import { ThemeToggle } from "@/components/ThemeToggle";

interface DashboardHeaderProps {
  devices: Device[];
}

export function DashboardHeader({ devices }: DashboardHeaderProps) {
  const onlineCount = devices.filter((d) => d.status === "online").length;
  const anomalyCount = devices.filter((d) => d.anomaly).length;

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-card/50 backdrop-blur-sm">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="text-foreground font-semibold">Alcate-IA</span>
        <span className="text-border">/</span>
        <span>Dashboard</span>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-full border border-primary/20">
          <Sparkles className="w-3 h-3" />
          <span className="font-medium">IA Ativa</span>
        </div>

        {anomalyCount > 0 && (
          <div className="flex items-center gap-1.5 text-xs bg-warning/10 text-warning px-3 py-1.5 rounded-full border border-warning/20">
            <Brain className="w-3 h-3" />
            <span className="font-medium">{anomalyCount} alertas IA</span>
          </div>
        )}

        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Wifi className="w-3.5 h-3.5 text-success" />
          <span>
            Online <span className="text-foreground font-semibold">({onlineCount}/{devices.length})</span>
          </span>
        </div>

        <ThemeToggle />
      </div>
    </header>
  );
}
