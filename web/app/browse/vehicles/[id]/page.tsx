import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Shield, Fuel, Users, Gauge, Phone, MessageCircle } from "lucide-react";
import Link from "next/link";

const VEHICLES: Record<string, {
  title: string;
  subtitle: string;
  pricePerDay: number;
  location: string;
  rating: number;
  reviewCount: number;
  image: string;
  fuel: string;
  seats: number;
  transmission: string;
  features: string[];
}> = {
  "1": {
    title: "Toyota Hilux 2022",
    subtitle: "Double Cab · 4x4",
    pricePerDay: 169,
    location: "Accra, Ghana",
    rating: 4.8,
    reviewCount: 24,
    image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&q=80",
    fuel: "Diesel",
    seats: 4,
    transmission: "Manual",
    features: [
      "Air conditioning",
      "Bluetooth audio",
      "Reverse camera",
      "USB charging ports",
      "First aid kit",
      "Insurance included",
    ],
  },
  "2": {
    title: "Mercedes-Benz C300",
    subtitle: "Luxury sedan",
    pricePerDay: 220,
    location: "Accra, Ghana",
    rating: 4.9,
    reviewCount: 36,
    image: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=80",
    fuel: "Petrol",
    seats: 4,
    transmission: "Automatic",
    features: [
      "Leather seats",
      "Climate control",
      "Premium sound system",
      "GPS navigation",
      "WiFi hotspot",
      "Insurance included",
    ],
  },
  "3": {
    title: "Toyota Hiace 2021",
    subtitle: "14-seater bus",
    pricePerDay: 180,
    location: "Kumasi, Ghana",
    rating: 4.7,
    reviewCount: 18,
    image: "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=800&q=80",
    fuel: "Diesel",
    seats: 14,
    transmission: "Manual",
    features: [
      "Spacious seating",
      "Air conditioning",
      "Large luggage space",
      "TV entertainment",
      "Microphone system",
      "Insurance included",
    ],
  },
  "4": {
    title: "Nissan Patrol 2021",
    subtitle: "SUV · 7 seats",
    pricePerDay: 210,
    location: "Accra, Ghana",
    rating: 4.9,
    reviewCount: 42,
    image: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&q=80",
    fuel: "Petrol",
    seats: 7,
    transmission: "Automatic",
    features: [
      "4WD capability",
      "Leather interior",
      "Panoramic sunroof",
      "Premium sound system",
      "Off-road tyres",
      "Insurance included",
    ],
  },
};

export default function VehicleDetailPage({ params }: { params: { id: string } }) {
  const vehicle = VEHICLES[params.id] || VEHICLES["1"];

  return (
    <main className="min-h-screen">
      <div className="bg-slate-50 border-b border-border">
        <div className="container mx-auto px-4 md:px-6 py-8 md:py-12">
          <Link href="/browse/vehicles">
            <Button variant="ghost" size="sm" className="mb-6">
              ← Back to vehicles
            </Button>
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 mb-4 shadow-lg">
                <img
                  src={vehicle.image}
                  alt={vehicle.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div>
              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  <h1 className="text-3xl font-bold text-foreground mb-2">{vehicle.title}</h1>
                  <p className="text-secondary mb-4">{vehicle.subtitle} · {vehicle.location}</p>
                </div>
                <Badge className="bg-amber-50 text-amber-700 border-amber-200 shrink-0">
                  <Star className="h-3 w-3 mr-1 fill-current" />
                  {vehicle.rating}
                </Badge>
              </div>
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-3xl font-bold text-primary">GH₵ {vehicle.pricePerDay}</span>
                <span className="text-secondary">/day</span>
              </div>
              <div className="flex flex-wrap gap-3 mb-6">
                <Badge variant="outline" className="flex items-center gap-1">
                  <Fuel className="h-3.5 w-3.5" />
                  {vehicle.fuel}
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" />
                  {vehicle.seats} seats
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Gauge className="h-3.5 w-3.5" />
                  {vehicle.transmission}
                </Badge>
              </div>
              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-green-600 shrink-0" />
                  <span>Verified vehicle with full documentation</span>
                </div>
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-green-600 shrink-0" />
                  <span>Insurance included on all trips</span>
                </div>
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-green-600 shrink-0" />
                  <span>24/7 roadside assistance</span>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/book" className="flex-1">
                  <Button size="lg" className="w-full">
                    Book Now
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Call Us
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 py-8 md:py-12">
        <h2 className="text-2xl font-bold text-foreground mb-6">Vehicle Features</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {vehicle.features.map((feature) => (
            <div key={feature} className="flex items-center gap-3 p-4 bg-white rounded-xl border border-border">
              <div className="h-2 w-2 rounded-full bg-primary shrink-0" />
              <span className="text-sm font-medium text-foreground">{feature}</span>
            </div>
          ))}
        </div>

        <Separator className="my-8" />

        <h2 className="text-2xl font-bold text-foreground mb-6">Reviews</h2>
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-border p-6">
            <div className="flex items-center gap-1 mb-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <p className="text-secondary mb-4">
              &ldquo;Excellent vehicle, very clean and well-maintained. The driver was punctual and professional. Will definitely book again!&rdquo;
            </p>
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-xs font-bold text-primary">JM</span>
              </div>
              <div>
                <div className="font-semibold text-sm">John Mensah</div>
                <div className="text-xs text-secondary">Accra, Ghana</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
