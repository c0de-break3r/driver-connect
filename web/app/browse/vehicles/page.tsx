import { VehicleGrid } from "@/components/vehicle-grid";

export default function BrowseVehiclesPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="mb-8 md:mb-10">
          <h1 className="text-3xl font-bold text-foreground md:text-5xl mb-4">
            Browse Vehicles
          </h1>
          <p className="text-lg text-secondary max-w-2xl">
            Discover a wide range of vehicles available for booking across Ghana.
          </p>
        </div>
        <VehicleGrid />
      </div>
    </main>
  );
}
