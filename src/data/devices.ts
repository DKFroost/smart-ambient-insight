export type DeviceStatus = "online" | "offline" | "maintenance";

export interface Device {
  id: string;
  name: string;
  status: DeviceStatus;
  temperature: number;
  humidity: number;
  battery: number;
  signal: string;
  doorStatus: "closed" | "open";
  aiInsight?: string;
  anomaly?: boolean;
}

export const devices: Device[] = [
  {
    id: "1",
    name: "Câmara Fria Receios/Matéria Prima",
    status: "online",
    temperature: 3.84,
    humidity: 91.21,
    battery: 100,
    signal: "B6:5A",
    doorStatus: "closed",
    aiInsight: "Temperatura estável nas últimas 6h",
  },
  {
    id: "2",
    name: "Câmara Ultra Congelamento 01",
    status: "online",
    temperature: -12.17,
    humidity: 87.16,
    battery: 97,
    signal: "B6:58",
    doorStatus: "closed",
    aiInsight: "Padrão normal de operação",
  },
  {
    id: "3",
    name: "Câmara Ultra Congelamento 02",
    status: "online",
    temperature: -7.5,
    humidity: 87.55,
    battery: 99,
    signal: "30:41",
    doorStatus: "closed",
    anomaly: true,
    aiInsight: "⚠ Tendência de aquecimento detectada pela IA",
  },
  {
    id: "4",
    name: "Câmara Ultra Congelamento 03",
    status: "online",
    temperature: -13.61,
    humidity: 84.26,
    battery: 95,
    signal: "30:55",
    doorStatus: "closed",
    aiInsight: "Eficiência energética ótima",
  },
  {
    id: "5",
    name: "Câmara Ultra Congelamento 04",
    status: "online",
    temperature: -9.68,
    humidity: 84.47,
    battery: 98,
    signal: "B6:56",
    doorStatus: "closed",
    aiInsight: "Ciclo de compressor otimizado por IA",
  },
  {
    id: "6",
    name: "Câmara Ultra Congelamento 05",
    status: "maintenance",
    temperature: 17.29,
    humidity: 85.23,
    battery: 100,
    signal: "B6:59",
    doorStatus: "closed",
    anomaly: true,
    aiInsight: "🔧 Manutenção preditiva recomendada pela IA",
  },
  {
    id: "7",
    name: "Câmara Ultra Congelamento 06",
    status: "online",
    temperature: -7.73,
    humidity: 86.11,
    battery: 95,
    signal: "30:6A",
    doorStatus: "closed",
    aiInsight: "Performance dentro do esperado",
  },
  {
    id: "8",
    name: "Câmara Ultra Congelamento 07",
    status: "online",
    temperature: -7.64,
    humidity: 90.4,
    battery: 98,
    signal: "30:57",
    doorStatus: "closed",
    aiInsight: "Consumo energético reduzido em 12%",
  },
  {
    id: "9",
    name: "Caminhão RLK-1160",
    status: "online",
    temperature: -12,
    humidity: 95.12,
    battery: 91,
    signal: "A9:50",
    doorStatus: "closed",
    aiInsight: "Rota otimizada mantendo cadeia fria",
  },
  {
    id: "10",
    name: "Sala De Expedição 08",
    status: "online",
    temperature: -6.89,
    humidity: 92.69,
    battery: 99,
    signal: "30:58",
    doorStatus: "closed",
    aiInsight: "Fluxo de ar ideal detectado",
  },
  {
    id: "11",
    name: "Sala Principal, Porta Grande",
    status: "online",
    temperature: -8.61,
    humidity: 90.71,
    battery: 100,
    signal: "B6:58",
    doorStatus: "closed",
    aiInsight: "Sem anomalias nas últimas 24h",
  },
];
