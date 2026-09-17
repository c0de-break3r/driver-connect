import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

export default function DriverDetailPage({ params }: { params: { id: string } }) {
  return (
    <main className="container mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="mb-6">
          <Link href="/browse/drivers">
            <Button variant="ghost" size="sm">
              ← Back to drivers
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="aspect-square rounded-2xl overflow-hidden bg-slate-100 mb-4 shadow-lg">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80"
                alt="Driver"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-3 w-3 rounded-full bg-success" />
              <span className="font-medium">Verified Driver</span>
            </div>
            <Link href="/book">
              <Button size="lg" className="w-full">
                Book This Driver
              </Button>
            </Link>
          </div>
          <div className="lg:col-span-2">
            <h1 className="text-3xl font-bold text-foreground mb-2">Kwame Asante</h1>
            <p className="text-secondary mb-4">Kumasi, Ashanti · 5+ years on platform</p>
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-1">
                <span className="text-2xl font-bold">4.98</span>
                <span className="text-secondary">/ 5</span>
              </div>
              <span className="text-secondary">342 trips completed</span>
            </div>
            <div className="prose max-w-none mb-8">
              <p>
                Professional driver with 5+ years of experience. Specializes in Sedan and SUV trips across Ashanti and beyond.
                Known for punctuality, clean vehicles, and local route expertise.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl">
                <h3 className="font-semibold mb-2">Vehicle Types</h3>
                <p className="text-secondary">Sedan, SUV</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl">
                <h3 className="font-semibold mb-2">Languages</h3>
                <p className="text-secondary">English, Twi</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl">
                <h3 className="font-semibold mb-2">Hourly Rate</h3>
                <p className="text-secondary">GH₵ 35 / hour</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl">
                <h3 className="font-semibold mb-2">Service Area</h3>
                <p className="text-secondary">Ashanti Region</p>
              </div>
            </div>
          </div>
        </div>
      </main>
  );
}
