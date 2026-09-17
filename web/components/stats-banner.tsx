"use client";

const STATS = [
  { value: "5,000+", label: "Happy Customers" },
  { value: "24/7", label: "Service Available" },
  { value: "100%", label: "Verified Drivers" },
  { value: "4.9★", label: "Customer Rating" },
];

export function StatsBanner() {
  return (
    <section className="bg-gold py-6">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-primary">
          {STATS.map((stat) => (
            <div key={stat.label}>
              <div className="text-3xl md:text-4xl font-black mb-1">{stat.value}</div>
              <div className="text-sm font-medium text-primary/80">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
