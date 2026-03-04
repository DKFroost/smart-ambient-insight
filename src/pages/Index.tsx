import { Sidebar } from "@/components/dashboard/Sidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DeviceCard } from "@/components/dashboard/DeviceCard";
import { devices } from "@/data/devices";

const Index = () => {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardHeader />
        <main className="flex-1 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {devices.map((device, i) => (
              <DeviceCard key={device.id} device={device} index={i} />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
