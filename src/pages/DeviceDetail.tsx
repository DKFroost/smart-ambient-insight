import { useParams, useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { useDevices } from "@/hooks/useDevices";
import { Thermometer, Droplets, Battery, Lock, LockOpen, RefreshCw, Settings, FileText, MapPin } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useState } from "react";

// Generate mock historical data
function generateHistoricalData(hours: number) {
  const data = [];
  const now = new Date();
  const interval = hours <= 1 ? 5 : hours <= 24 ? 30 : 180; // minutes
  const points = (hours * 60) / interval;

  for (let i = points; i >= 0; i--) {
    const time = new Date(now.getTime() - i * interval * 60000);
    data.push({
      time: `${String(time.getHours()).padStart(2, "0")}:${String(time.getMinutes()).padStart(2, "0")}`,
      temperatura: parseFloat((Math.random() * 8 - 1).toFixed(1)),
      umidade: parseFloat((85 + Math.random() * 15).toFixed(1)),
    });
  }
  return data;
}

const DeviceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: devices } = useDevices();
  const [period, setPeriod] = useState<"1H" | "24H" | "7D">("24H");
  const [chartData] = useState(() => generateHistoricalData(24));

  const device = devices?.find((d) => d.id === id);

  if (!devices) return null;
  if (!device) return <div className="p-8 text-muted-foreground">Dispositivo não encontrado.</div>;

  const statusConfig: Record<string, { label: string; className: string }> = {
    online: { label: "ONLINE", className: "bg-success/15 text-success border border-success/20" },
    maintenance: { label: "MANUTENÇÃO", className: "bg-maintenance/15 text-maintenance border border-maintenance/20" },
    offline: { label: "OFFLINE", className: "bg-muted text-muted-foreground border border-border" },
  };
  const status = statusConfig[device.status];

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar devices={devices} />
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-card/50 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <button onClick={() => navigate("/")} className="text-foreground font-semibold hover:underline">Alcate-IA</button>
            <span className="text-border">&gt;</span>
            <span>Detalhes do Sensor</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Online ({devices.filter(d => d.status === "online").length}/{devices.length})</span>
          </div>
        </header>

        <main className="flex-1 p-6 space-y-6 overflow-auto">
          {/* Device Title */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                <Settings className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-bold text-foreground">{device.name}</h1>
                  <span className={`text-[10px] font-bold tracking-wider px-2.5 py-1 rounded-full ${status.className}`}>
                    {status.label}
                  </span>
                  <span className={`text-[10px] font-bold tracking-wider px-2.5 py-1 rounded-full flex items-center gap-1 ${
                    device.door_status === "closed"
                      ? "bg-success/15 text-success border border-success/20"
                      : "bg-destructive/15 text-destructive border border-destructive/20"
                  }`}>
                    {device.door_status === "closed" ? <Lock className="w-3 h-3" /> : <LockOpen className="w-3 h-3" />}
                    {device.door_status === "closed" ? "Porta Fechada" : "Porta Aberta"}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground font-mono mt-0.5">{device.signal || "BC:57:29:1F:86:5A"}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <button className="flex items-center gap-1.5 hover:text-foreground transition-colors">
                <RefreshCw className="w-4 h-4" />
              </button>
              <button className="flex items-center gap-1.5 hover:text-foreground transition-colors">
                <FileText className="w-4 h-4" />
                Relatório
              </button>
              <button className="flex items-center gap-1.5 hover:text-foreground transition-colors">
                <Settings className="w-4 h-4" />
                Configurar
              </button>
            </div>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div className="bg-card border border-border rounded-xl p-5">
              <p className="text-[10px] font-semibold text-muted-foreground tracking-widest uppercase mb-3">Temperatura</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-foreground font-mono">{Number(device.temperature).toFixed(2)}</span>
                <span className="text-sm text-muted-foreground">°C</span>
                <span className="text-xs text-muted-foreground ml-1">/ 10°C</span>
              </div>
            </div>
            <div className="bg-card border border-border rounded-xl p-5">
              <p className="text-[10px] font-semibold text-muted-foreground tracking-widest uppercase mb-3">Umidade</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-foreground font-mono">{Number(device.humidity).toFixed(2)}</span>
                <span className="text-sm text-muted-foreground">%</span>
                <span className="text-xs text-muted-foreground ml-1">/ 100%</span>
              </div>
            </div>
            <div className="bg-card border border-border rounded-xl p-5">
              <p className="text-[10px] font-semibold text-muted-foreground tracking-widest uppercase mb-3">Bateria</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-foreground font-mono">{device.battery}</span>
                <span className="text-sm text-muted-foreground">%</span>
              </div>
            </div>
            <div className="bg-card border border-border rounded-xl p-5 hidden lg:block">
              <p className="text-[10px] font-semibold text-muted-foreground tracking-widest uppercase mb-3">Localização</p>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                <div className="text-xs text-muted-foreground leading-relaxed">
                  <p className="text-foreground text-sm font-medium">Sede Principal</p>
                  <p>Lat: -27.50740</p>
                  <p>Lng: -48.65221</p>
                </div>
              </div>
            </div>
          </div>

          {/* Historical Chart */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-base font-semibold text-foreground">Histórico</h2>
              <div className="flex items-center gap-3">
                <div className="flex rounded-lg border border-border overflow-hidden">
                  {(["1H", "24H", "7D"] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPeriod(p)}
                      className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                        period === p
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
                <button className="flex items-center gap-1.5 text-xs text-primary font-medium hover:underline">
                  <FileText className="w-3.5 h-3.5" />
                  Exportar Excel
                </button>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 86%)" />
                <XAxis dataKey="time" tick={{ fontSize: 10, fill: "hsl(220 9% 46%)" }} interval="preserveStartEnd" />
                <YAxis yAxisId="temp" tick={{ fontSize: 10, fill: "hsl(220 9% 46%)" }} />
                <YAxis yAxisId="hum" orientation="right" tick={{ fontSize: 10, fill: "hsl(220 9% 46%)" }} domain={[80, 100]} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid hsl(220 13% 86%)" }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line yAxisId="temp" type="monotone" dataKey="temperatura" name="Temperatura" stroke="hsl(38 92% 50%)" strokeWidth={2} dot={false} />
                <Line yAxisId="hum" type="monotone" dataKey="umidade" name="Umidade" stroke="hsl(200 80% 50%)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DeviceDetail;
