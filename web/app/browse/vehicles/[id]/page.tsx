import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

export default function VehicleDetailPage({ params }: { params: { id: string } }) {
  return (
    <main className="container mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="mb-6">
          <Link href="/browse/vehicles">
            <Button variant="ghost" size="sm">
              ← Back to vehicles
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 mb-4 shadow-lg">
              <img
                src="https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&q=80"
                alt="Vehicle"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Toyota Hilux 2022</h1>
            <p className="text-secondary mb-4">Double Cab · 4x4 · Accra, Ghana</p>
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-3xl font-bold text-primary">GH₵ 169</span>
              <span className="text-secondary">/day</span>
            </div>
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-success" />
                <span>Verified vehicle</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-success" />
                <span>Insurance included</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-success" />
                <span>24/7 roadside assistance</span>
              </div>
            </div>
            <Link href="/book">
              <Button size="lg" className="w-full md:w-auto">
                Book Now
              </Button>
            </Link>
          </div>
        </div>
      </main>
  );
}
