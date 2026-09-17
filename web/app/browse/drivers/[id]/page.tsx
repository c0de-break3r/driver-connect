import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Shield, Phone, MessageCircle, Languages, Car } from "lucide-react";
import Link from "next/link";

const DRIVERS: Record<string, {
  name: string;
  location: string;
  rating: number;
  trips: number;
  hourlyRate: number;
  image: string;
  isVerified: boolean;
  yearsOnPlatform: string;
  vehicleType: string;
  languages: string;
  bio: string;
}> = {
  "1": {
    name: "Kwame Asante",
    location: "Kumasi, Ashanti",
    rating: 4.98,
    trips: 342,
    hourlyRate: 35,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
    isVerified: true,
    yearsOnPlatform: "5+ years",
    vehicleType: "Sedan, SUV",
    languages: "English, Twi",
    bio: "Professional driver with 5+ years of experience. Specializes in Sedan and SUV trips across Ashanti and beyond. Known for punctuality, clean vehicles, and local route expertise.",
  },
  "2": {
    name: "Ama Serwaa",
    location: "Accra, Greater Accra",
    rating: 4.95,
    trips: 518,
    hourlyRate: 45,
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80",
    isVerified: true,
    yearsOnPlatform: "6+ years",
    vehicleType: "Luxury, SUV",
    languages: "English, Ga, Twi",
    bio: "Experienced luxury transport specialist. Provides premium service for corporate clients, airport transfers, and special events across Greater Accra.",
  },
  "3": {
    name: "Kofi Mensah",
    location: "Tema, Greater Accra",
    rating: 4.88,
    trips: 215,
    hourlyRate: 30,
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80",
    isVerified: true,
    yearsOnPlatform: "4+ years",
    vehicleType: "Van, Bus",
    languages: "English, Twi",
    bio: "Reliable driver specializing in group transport and city transfers. Experienced with airport pickups, city tours, and intercity travel.",
  },
  "4": {
    name: "Abena Osei",
    location: "Cape Coast, Central",
    rating: 4.92,
    trips: 289,
    hourlyRate: 40,
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80",
    isVerified: true,
    yearsOnPlatform: "5+ years",
    vehicleType: "Sedan, Truck",
    languages: "English, Fante",
    bio: "Dedicated professional driver with extensive knowledge of Central Region and beyond. Specializes in coastal routes and intercity travel.",
  },
};

export default function DriverDetailPage({ params }: { params: { id: string } }) {
  const driver = DRIVERS[params.id] || DRIVERS["1"];

  return (
    <main className="min-h-screen">
      <div className="bg-slate-50 border-b border-border">
        <div className="container mx-auto px-4 md:px-6 py-8 md:py-12">
          <Link href="/browse/drivers">
            <Button variant="ghost" size="sm" className="mb-6">
              ← Back to drivers
            </Button>
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <div className="aspect-square rounded-2xl overflow-hidden bg-slate-100 mb-4 shadow-lg">
                <img
                  src={driver.image}
                  alt={driver.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-3 w-3 rounded-full bg-green-500" />
                <span className="font-medium">Verified Driver</span>
              </div>
              <div className="flex flex-col gap-3">
                <Link href="/book">
                  <Button size="lg" className="w-full">
                    Book This Driver
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="flex items-center justify-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp Chat
                </Button>
              </div>
            </div>
            <div className="lg:col-span-2">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  <h1 className="text-3xl font-bold text-foreground mb-2">{driver.name}</h1>
                  <p className="text-secondary mb-4">{driver.location} · {driver.yearsOnPlatform} on platform</p>
                </div>
                <Badge className="bg-amber-50 text-amber-700 border-amber-200 shrink-0">
                  <Star className="h-3 w-3 mr-1 fill-current" />
                  {driver.rating}
                </Badge>
              </div>
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-1">
                  <span className="text-2xl font-bold">{driver.rating}</span>
                  <span className="text-secondary">/ 5</span>
                </div>
                <span className="text-secondary">{driver.trips} trips completed</span>
              </div>
              <p className="text-secondary leading-relaxed mb-8">{driver.bio}</p>
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="p-4 bg-white rounded-xl border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <Car className="h-4 w-4 text-primary" />
                    <h3 className="font-semibold text-sm">Vehicle Types</h3>
                  </div>
                  <p className="text-secondary text-sm">{driver.vehicleType}</p>
                </div>
                <div className="p-4 bg-white rounded-xl border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <Languages className="h-4 w-4 text-primary" />
                    <h3 className="font-semibold text-sm">Languages</h3>
                  </div>
                  <p className="text-secondary text-sm">{driver.languages}</p>
                </div>
                <div className="p-4 bg-white rounded-xl border border-border">
                  <h3 className="font-semibold text-sm mb-1">Hourly Rate</h3>
                  <p className="text-secondary text-sm">GH₵ {driver.hourlyRate} / hour</p>
                </div>
                <div className="p-4 bg-white rounded-xl border border-border">
                  <h3 className="font-semibold text-sm mb-1">Service Area</h3>
                  <p className="text-secondary text-sm">{driver.location}</p>
                </div>
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
                    &ldquo;Excellent service! Kwame was punctual, professional, and the car was in perfect condition. Highly recommended for anyone looking for a reliable driver.&rdquo;
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-xs font-bold text-primary">SA</span>
                    </div>
                    <div>
                      <div className="font-semibold text-sm">Sarah Adams</div>
                      <div className="text-xs text-secondary">Kumasi, Ghana</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
