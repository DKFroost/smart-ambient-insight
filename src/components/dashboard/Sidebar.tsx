import { motion } from "framer-motion";
import { LayoutDashboard, Radio, Settings, Cpu, Brain, ChevronRight } from "lucide-react";
import type { Device } from "@/hooks/useDevices";

const navItems = [
  { label: "Visão Geral", icon: LayoutDashboard, active: true, section: "MONITORAMENTO" },
  { label: "Gateways", icon: Radio, active: false },
  { label: "Setores", icon: Settings, active: false, section: "GERENCIAMENTO" },
  { label: "Insights IA", icon: Brain, active: false, section: "INTELIGÊNCIA" },
];

interface SidebarProps {
  devices: Device[];
}

export function Sidebar({ devices }: SidebarProps) {
  return (
    <aside className="w-64 min-h-screen bg-sidebar border-r border-sidebar-border flex flex-col shrink-0">
      <div className="p-5 border-b border-sidebar-border">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <Cpu className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-foreground tracking-tight">Alcate-IA</h1>
            <p className="text-[10px] text-muted-foreground font-medium tracking-widest uppercase">Cold Chain</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => (
          <div key={item.label}>
            {item.section && (
              <p className="text-[10px] font-semibold text-muted-foreground tracking-widest uppercase px-3 mt-4 mb-2">
                {item.section}
              </p>
            )}
            <motion.button
              whileHover={{ x: 2 }}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                item.active
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-sidebar-foreground hover:bg-sidebar-accent"
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
              {item.active && <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-60" />}
            </motion.button>
          </div>
        ))}

        <p className="text-[10px] font-semibold text-muted-foreground tracking-widest uppercase px-3 mt-6 mb-2">
          DISPOSITIVOS ({devices.length})
        </p>
        <div className="space-y-0.5 max-h-[400px] overflow-y-auto pr-1">
          {devices.map((device) => (
            <button
              key={device.id}
              className="w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-xs text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
            >
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${
                  device.status === "online"
                    ? "bg-success"
                    : device.status === "maintenance"
                    ? "bg-warning"
                    : "bg-destructive"
                }`}
              />
              <span className="truncate">{device.name}</span>
            </button>
          ))}
        </div>
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <p className="text-[10px] text-muted-foreground">v2.4.0 · AI Engine v3.1</p>
      </div>
    </aside>
  );
}
