"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "motion/react";
import { MapPin, Calendar, Users, Star } from "lucide-react";

const TRIPS = [
  {
    id: 1,
    route: "Accra → Kumasi",
    date: "Dec 20, 2024",
    passengers: 2,
    status: "confirmed",
    price: "GH₵ 450",
    rating: 4.9,
  },
  {
    id: 2,
    route: "Accra → Cape Coast",
    date: "Jan 5, 2025",
    passengers: 4,
    status: "pending",
    price: "GH₵ 320",
    rating: 4.8,
  },
];

export default function TripsPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground md:text-5xl mb-2">
            My Trips
          </h1>
          <p className="text-lg text-secondary">
            View and manage your upcoming and past trips.
          </p>
        </div>

        <div className="space-y-4">
          {TRIPS.map((trip, index) => (
            <motion.div
              key={trip.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <div className="bg-white rounded-2xl border border-border shadow-lg p-6 md:p-8">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold text-foreground text-lg">{trip.route}</h3>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-secondary mb-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {trip.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {trip.passengers} passengers
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                        {trip.rating} rating
                      </span>
                    </div>
                    <Badge
                      variant={trip.status === "confirmed" ? "success" : "warning"}
                      className="mb-2"
                    >
                      {trip.status === "confirmed" ? "Confirmed" : "Pending"}
                    </Badge>
                  </div>
                  <div className="text-left md:text-right">
                    <p className="text-2xl font-bold text-primary mb-3">{trip.price}</p>
                    <Link href="/book">
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="mt-8 text-center"
        >
          <Link href="/browse/vehicles">
            <Button size="lg" variant="outline">
              Book a New Trip
            </Button>
          </Link>
        </motion.div>
      </div>
    </main>
  );
}
