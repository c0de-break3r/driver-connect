import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

export default function BookPage() {
  return (
    <main className="container mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-foreground md:text-5xl mb-8">
            Book Your Ride
          </h1>
          <div className="bg-white rounded-2xl border border-border shadow-xl p-6 md:p-8 space-y-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Pickup Location
              </label>
              <input
                type="text"
                placeholder="Enter pickup address"
                className="w-full h-14 rounded-xl border border-slate-200 bg-slate-50/50 px-4 text-base"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Drop-off Location
              </label>
              <input
                type="text"
                placeholder="Enter drop-off address"
                className="w-full h-14 rounded-xl border border-slate-200 bg-slate-50/50 px-4 text-base"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Pickup Date
                </label>
                <input
                  type="date"
                  className="w-full h-14 rounded-xl border border-slate-200 bg-slate-50/50 px-4 text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Pickup Time
                </label>
                <input
                  type="time"
                  className="w-full h-14 rounded-xl border border-slate-200 bg-slate-50/50 px-4 text-base"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Passengers
              </label>
              <select className="w-full h-14 rounded-xl border border-slate-200 bg-slate-50/50 px-4 text-base">
                <option>1 passenger</option>
                <option>2 passengers</option>
                <option>3 passengers</option>
                <option>4 passengers</option>
                <option>5+ passengers</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Special Requests (optional)
              </label>
              <textarea
                placeholder="Any special requirements..."
                rows={3}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-base"
              />
            </div>
            <Separator />
            <div>
              <Link href="/sign-in">
                <Button size="lg" className="w-full">
                  Continue to Payment
                </Button>
              </Link>
              <p className="text-sm text-secondary text-center mt-4">
                You need to sign in to complete your booking
              </p>
            </div>
          </div>
        </div>
      </main>
  );
}
