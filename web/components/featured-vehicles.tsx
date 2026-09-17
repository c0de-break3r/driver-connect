"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Fuel, Users, Gauge } from "lucide-react";
import { motion, useReducedMotion, useMotionValue, useSpring } from "motion/react";

const FEATURED_VEHICLES = [
  {
    id: "1",
    title: "Toyota Voxy Minivan",
    subtitle: "Minivan · 7 Seats · 5 Bags",
    pricePerDay: 800,
    location: "Accra, Ghana",
    rating: 4.9,
    reviewCount: 24,
    image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&q=80",
    fuel: "Petrol",
    seats: 7,
    transmission: "Automatic",
  },
  {
    id: "2",
    title: "Toyota Hiace VAN",
    subtitle: "Economy · 14 Seats · 10 Bags",
    pricePerDay: 1500,
    location: "Accra, Ghana",
    rating: 4.8,
    reviewCount: 36,
    image: "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=800&q=80",
    fuel: "Diesel",
    seats: 14,
    transmission: "Manual",
  },
  {
    id: "3",
    title: "Toyota Landcruiser V8",
    subtitle: "SUV · 7 Seats · 6 Bags",
    pricePerDay: 2200,
    location: "Accra, Ghana",
    rating: 4.9,
    reviewCount: 18,
    image: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&q=80",
    fuel: "Diesel",
    seats: 7,
    transmission: "Automatic",
  },
  {
    id: "4",
    title: "Executive Sedan",
    subtitle: "Sedan · 4 Seats · 2 Bags",
    pricePerDay: 1200,
    location: "Accra, Ghana",
    rating: 4.9,
    reviewCount: 42,
    image: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=80",
    fuel: "Petrol",
    seats: 4,
    transmission: "Automatic",
  },
];

function TiltCard({ children, className }: { children: React.ReactNode; className?: string }) {
  const shouldReduceMotion = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useMotionValue(0), { stiffness: 200, damping: 20 });
  const rotateY = useSpring(useMotionValue(0), { stiffness: 200, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (shouldReduceMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const deltaX = e.clientX - centerX;
    const deltaY = e.clientY - centerY;
    x.set(deltaX);
    y.set(deltaY);
    rotateX.set(-deltaY / 24);
    rotateY.set(deltaX / 24);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <motion.div
      style={{ rotateX, rotateY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

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
              <TiltCard className="h-full">
                <Link href={`/browse/vehicles/${vehicle.id}`}>
                  <Card className="group h-full overflow-hidden border border-border/70 shadow-sm hover:shadow-2xl transition-all">
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
                      <div className="flex items-center gap-3 mb-4 text-xs text-secondary">
                        <span className="flex items-center gap-1">
                          <Fuel className="h-3.5 w-3.5" />
                          {vehicle.fuel}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" />
                          {vehicle.seats} seats
                        </span>
                        <span className="flex items-center gap-1">
                          <Gauge className="h-3.5 w-3.5" />
                          {vehicle.transmission}
                        </span>
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
              </TiltCard>
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
