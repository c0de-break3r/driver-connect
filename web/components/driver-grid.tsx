"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin } from "lucide-react";

const DRIVERS = [
  {
    id: "1",
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
  },
  {
    id: "2",
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
  },
  {
    id: "3",
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
  },
  {
    id: "4",
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
  },
];

export function DriverGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {DRIVERS.map((driver) => (
        <Link key={driver.id} href={`/browse/drivers/${driver.id}`}>
          <Card className="group h-full overflow-hidden hover:shadow-xl transition-all duration-300 border-0 shadow-md">
            <div className="aspect-square overflow-hidden bg-slate-100">
              <img
                src={driver.image}
                alt={driver.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    {driver.name}
                  </h3>
                  <div className="flex items-center text-sm text-secondary mt-1.5">
                    <MapPin className="h-4 w-4 mr-1.5" />
                    {driver.location}
                  </div>
                </div>
                {driver.isVerified && (
                  <Badge variant="success" className="shrink-0 bg-green-50 text-green-700 border-green-200">
                    <Star className="h-3 w-3 mr-1 fill-current" />
                    Verified
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-4 text-sm text-secondary mb-4">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{driver.rating}</span>
                </div>
                <span>{driver.trips} trips</span>
              </div>
              <div className="mt-3 pt-3 border-t border-border">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-secondary">{driver.vehicleType}</span>
                  <span className="font-semibold text-primary">
                    GH₵ {driver.hourlyRate}/hr
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
