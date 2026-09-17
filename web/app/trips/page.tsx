import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

export default function TripsPage() {
  return (
    <main className="container mx-auto px-4 md:px-6 py-8 md:py-12">
        <h1 className="text-3xl font-bold text-foreground md:text-5xl mb-8">
          My Trips
        </h1>
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-border shadow-lg p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <h3 className="font-semibold text-foreground mb-1">Accra → Kumasi</h3>
                <p className="text-sm text-secondary mb-3">Dec 20, 2024 · 2 passengers</p>
                <span className="inline-block px-3 py-1 rounded-full bg-green-50 text-green-700 border border-green-200 text-xs font-bold">
                  Confirmed
                </span>
              </div>
              <div className="text-left md:text-right">
                <p className="text-2xl font-bold text-primary">GH₵ 450</p>
                <Link href="/book">
                  <Button variant="outline" size="sm" className="mt-3">
                    View Details
                  </Button>
                </Link>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-border shadow-lg p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <h3 className="font-semibold text-foreground mb-1">Accra → Cape Coast</h3>
                <p className="text-sm text-secondary mb-3">Jan 5, 2025 · 4 passengers</p>
                <span className="inline-block px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold">
                  Pending
                </span>
              </div>
              <div className="text-left md:text-right">
                <p className="text-2xl font-bold text-primary">GH₵ 320</p>
                <Link href="/book">
                  <Button variant="outline" size="sm" className="mt-3">
                    View Details
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
  );
}
