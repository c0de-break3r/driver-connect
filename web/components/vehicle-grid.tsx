"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin } from "lucide-react";

const VEHICLES = [
  {
    id: "1",
    title: "Toyota Hilux 2022",
    subtitle: "Double Cab · 4x4",
    pricePerDay: 169,
    location: "Accra, Ghana",
    rating: 4.8,
    reviewCount: 24,
    image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&q=80",
  },
  {
    id: "2",
    title: "Mercedes-Benz C300",
    subtitle: "Luxury sedan",
    pricePerDay: 220,
    location: "Accra, Ghana",
    rating: 4.9,
    reviewCount: 36,
    image: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=80",
  },
  {
    id: "3",
    title: "Toyota Hiace 2021",
    subtitle: "14-seater bus",
    pricePerDay: 180,
    location: "Kumasi, Ghana",
    rating: 4.7,
    reviewCount: 18,
    image: "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=800&q=80",
  },
  {
    id: "4",
    title: "Nissan Patrol 2021",
    subtitle: "SUV · 7 seats",
    pricePerDay: 210,
    location: "Accra, Ghana",
    rating: 4.9,
    reviewCount: 42,
    image: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&q=80",
  },
];

export function VehicleGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {VEHICLES.map((vehicle) => (
        <Link key={vehicle.id} href={`/browse/vehicles/${vehicle.id}`}>
          <Card className="group h-full overflow-hidden hover:shadow-xl transition-all duration-300 border-0 shadow-md">
            <div className="aspect-[4/3] overflow-hidden bg-slate-100">
              <img
                src={vehicle.image}
                alt={vehicle.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    {vehicle.title}
                  </h3>
                  <p className="text-sm text-secondary mt-1">{vehicle.subtitle}</p>
                </div>
                <Badge variant="secondary" className="shrink-0 bg-amber-50 text-amber-700 border-amber-200">
                  <Star className="h-3 w-3 mr-1 fill-current" />
                  {vehicle.rating}
                </Badge>
              </div>
              <div className="flex items-center text-sm text-secondary mb-4">
                <MapPin className="h-4 w-4 mr-1.5" />
                {vehicle.location}
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-primary">
                  GH₵ {vehicle.pricePerDay}
                </span>
                <span className="text-sm text-secondary">/day</span>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
