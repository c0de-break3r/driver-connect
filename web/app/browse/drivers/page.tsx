import { DriverGrid } from "@/components/driver-grid";

export default function BrowseDriversPage() {
  return (
    <main className="container mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="mb-8 md:mb-10">
          <h1 className="text-3xl font-bold text-foreground md:text-5xl mb-4">
            Find a Driver
          </h1>
          <p className="text-lg text-secondary max-w-2xl">
            Browse verified professional drivers ready to take you wherever you need to go.
          </p>
        </div>
        <DriverGrid />
      </main>
  );
}
