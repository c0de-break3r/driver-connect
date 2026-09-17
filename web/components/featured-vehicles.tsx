"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, MapPin } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

const FEATURED_VEHICLES = [
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

export function FeaturedVehicles() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="mx-auto max-w-2xl text-center mb-14"
        >
          <span className="text-primary font-semibold text-sm uppercase tracking-widest">Our Fleet</span>
          <h2 className="text-3xl font-bold text-foreground md:text-4xl mt-2 mb-4">
            Featured Vehicles
          </h2>
          <p className="text-lg text-secondary leading-relaxed">
            Discover top-rated vehicles available for booking across Ghana.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURED_VEHICLES.map((vehicle, index) => (
            <motion.div
              key={vehicle.id}
              initial={shouldReduceMotion ? {} : { opacity: 0, y: 40 }}
              whileInView={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={shouldReduceMotion ? {} : { duration: 0.5, delay: index * 0.1 }}
            >
              <Link href={`/browse/vehicles/${vehicle.id}`}>
                <Card className="group h-full overflow-hidden border border-border/70 shadow-sm hover:shadow-xl transition-all">
                  <div className="aspect-[4/3] overflow-hidden bg-slate-100 relative">
                    <img
                      src={vehicle.image}
                      alt={vehicle.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-white/90 text-foreground border-0 shadow-sm">
                        <Star className="h-3 w-3 mr-1 fill-amber-400 text-amber-400" />
                        {vehicle.rating}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-5">
                    <div className="mb-3">
                      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                        {vehicle.title}
                      </h3>
                      <p className="text-sm text-secondary">{vehicle.subtitle}</p>
                    </div>
                    <div className="flex items-center text-sm text-secondary mb-4">
                      <MapPin className="mr-1.5 h-4 w-4" />
                      {vehicle.location}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-primary">
                          GH₵ {vehicle.pricePerDay}
                        </span>
                        <span className="text-sm text-secondary">/day</span>
                      </div>
                      <span className="text-xs text-secondary">{vehicle.reviewCount} reviews</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-12 text-center"
        >
          <Link href="/browse/vehicles">
            <Button size="lg" variant="outline" className="min-w-[200px]">
              View All Vehicles
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
