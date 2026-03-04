import { Sidebar } from "@/components/dashboard/Sidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DeviceCard } from "@/components/dashboard/DeviceCard";
import { useDevices } from "@/hooks/useDevices";
import { Skeleton } from "@/components/ui/skeleton";

const Index = () => {
  const { data: devices, isLoading } = useDevices();

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar devices={devices ?? []} />
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardHeader devices={devices ?? []} />
        <main className="flex-1 p-6">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-52 rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {(devices ?? []).map((device, i) => (
                <DeviceCard key={device.id} device={device} index={i} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Index;
