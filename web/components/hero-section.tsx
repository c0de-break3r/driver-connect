"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { motion, useReducedMotion, useMotionValue, useSpring } from "motion/react";
import { Star, MapPin, Play, Shield, Clock, Award, Users } from "lucide-react";

const STATS = [
  { value: "5,000+", label: "Happy Travellers" },
  { value: "24/7", label: "Service Available" },
  { value: "100%", label: "On-Time Promise" },
  { value: "4.9★", label: "Customer Rating" },
];

const SERVICES = [
  {
    icon: <Shield className="h-6 w-6" />,
    title: "Airport Pickup",
    description: "Meet & greet at arrivals with flight tracking and name board service.",
    image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=600&q=80",
    href: "/book?service=airport-pickup",
    color: "bg-primary",
  },
  {
    icon: <Clock className="h-6 w-6" />,
    title: "Airport Drop-off",
    description: "Doorstep pickup with on-time guarantee and air-conditioned vehicles.",
    image: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=600&q=80",
    href: "/book?service=airport-dropoff",
    color: "bg-amber-500",
  },
  {
    icon: <Award className="h-6 w-6" />,
    title: "Vehicle Rental",
    description: "Daily hire rates for sedans, SUVs and minivans — with or without driver.",
    image: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=600&q=80",
    href: "/browse/vehicles",
    color: "bg-purple-600",
  },
  {
    icon: <Users className="h-6 w-6" />,
    title: "Find a Driver",
    description: "Identity-verified, background-checked professionals for any route.",
    image: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=600&q=80",
    href: "/browse/drivers",
    color: "bg-green-600",
  },
];

const FEATURED_VEHICLES = [
  {
    id: "1",
    title: "Toyota Voxy Minivan",
    subtitle: "7 Seats · 5 Bags",
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
    subtitle: "14 Seats · 10 Bags",
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
    subtitle: "7 Seats · 6 Bags",
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
    subtitle: "4 Seats · 2 Bags",
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

export function HeroSection() {
  const shouldReduceMotion = useReducedMotion();
  const [serviceType, setServiceType] = useState("pickup");

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 to-white pb-16 md:pb-24 pt-16 md:pt-24">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/2 h-[600px] w-[1200px] -translate-x-1/2 bg-gradient-to-b from-primary/5 via-primary/3 to-transparent blur-3xl" />
      </div>

      <div className="container mx-auto px-4 md:px-6">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary mb-6 border border-primary/10"
            >
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              Ghana&apos;s Most Trusted Mobility Platform
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl mb-6 leading-[1.1]"
            >
              Reliable Drivers &amp; Vehicles{" "}
              <span className="text-primary">in Ghana</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-lg text-secondary md:text-xl mb-8 max-w-xl leading-relaxed"
            >
              Professional transport for every journey. Verified drivers, well-maintained vehicles, and secure booking — available 24/7 across Ghana.
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="flex flex-wrap gap-3 mb-10"
            >
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link href="/browse/vehicles">
                  <Button size="lg" className="font-semibold shadow-lg hover:shadow-xl transition-all">
                    Find a Vehicle
                  </Button>
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link href="/browse/drivers">
                  <Button size="lg" variant="outline" className="font-semibold">
                    Find a Driver
                  </Button>
                </Link>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="flex flex-wrap gap-6"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500/10 rounded-full flex items-center justify-center">
                  <Shield className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <div className="font-semibold text-sm">Verified Professionals</div>
                  <div className="text-xs text-secondary">Identity-checked drivers</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Star className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="font-semibold text-sm">4.9★ Rated</div>
                  <div className="text-xs text-secondary">By 5,000+ customers</div>
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="perspective-[1200px]"
          >
            <TiltCard className="bg-white rounded-3xl border border-border/80 shadow-2xl p-6 md:p-8 transform-gpu">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-foreground">Quick Booking</h2>
                  <p className="text-secondary text-sm">Find your ride in seconds</p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Play className="h-5 w-5 text-primary" />
                </div>
              </div>

              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Service Type</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { key: "pickup", label: "Pickup", icon: "🛬" },
                      { key: "dropoff", label: "Drop-off", icon: "🛫" },
                      { key: "rental", label: "Rental", icon: "🚗" },
                    ].map((option) => (
                      <label key={option.key} className="cursor-pointer">
                        <input
                          type="radio"
                          name="serviceType"
                          className="peer sr-only"
                          checked={serviceType === option.key}
                          onChange={() => setServiceType(option.key)}
                        />
                        <div className="peer-checked:bg-primary peer-checked:text-white peer-checked:border-primary border-2 border-slate-200 rounded-xl p-2.5 text-center transition-all hover:border-primary/50">
                          <span className="text-lg block mb-1">{option.icon}</span>
                          <span className="text-xs font-semibold">{option.label}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1">Airport / Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-3.5 h-5 w-5 text-muted-foreground" />
                    <select className="w-full h-12 rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-3 text-base">
                      <option>Accra International Airport – ACC</option>
                      <option>Kumasi Airport – KMS</option>
                      <option>Tamale Airport – TML</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-1">Date</label>
                    <input
                      type="date"
                      className="w-full h-12 rounded-xl border border-slate-200 bg-slate-50/50 px-3 text-base"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-1">Time</label>
                    <input
                      type="time"
                      className="w-full h-12 rounded-xl border border-slate-200 bg-slate-50/50 px-3 text-base"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1">Passengers</label>
                  <select className="w-full h-12 rounded-xl border border-slate-200 bg-slate-50/50 px-3 text-base">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                      <option key={n}>{n} Passenger{n > 1 ? "s" : ""}</option>
                    ))}
                  </select>
                </div>

                <Link href="/book">
                  <Button className="w-full h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all" size="lg">
                    Continue Booking →
                  </Button>
                </Link>
              </form>
            </TiltCard>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export function StatsBanner() {
  return (
    <section className="bg-gold py-6">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-primary">
          {STATS.map((stat) => (
            <div key={stat.label}>
              <div className="text-3xl md:text-4xl font-black mb-1">{stat.value}</div>
              <div className="text-sm font-medium text-primary/80">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
