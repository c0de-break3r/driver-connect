"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Search, MapPin, Calendar, Shield, Star } from "lucide-react";
import { motion } from "motion/react";

export function HeroSection() {
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
              className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary mb-6 border border-primary/10"
            >
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              Africa&apos;s Most Trusted Mobility Platform
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl mb-6 leading-[1.1]"
            >
              Reliable Drivers &amp; Vehicles{" "}
              <span className="text-primary">Across Africa</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-lg text-secondary md:text-xl mb-8 max-w-xl leading-relaxed"
            >
              Professional transport solutions for every journey. Verified drivers, well-maintained vehicles, and secure booking — available 24/7.
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
                    <Search className="mr-2 h-5 w-5" />
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
            className="bg-white rounded-2xl border border-border shadow-xl p-6 md:p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-foreground">Quick Booking</h2>
                <p className="text-secondary text-sm">Find your ride in seconds</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Search className="h-5 w-5 text-primary" />
              </div>
            </div>

            <form className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">What do you need?</label>
                <div className="grid grid-cols-3 gap-2">
                  {["Vehicle", "Driver", "Both"].map((option) => (
                    <label key={option} className="cursor-pointer">
                      <input type="radio" name="serviceType" className="peer sr-only" defaultChecked={option === "Vehicle"} />
                      <div className="peer-checked:bg-primary peer-checked:text-white peer-checked:border-primary border-2 border-slate-200 rounded-xl p-2.5 text-center transition-all hover:border-primary/50">
                        <span className="text-xs font-semibold">{option}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-1">Pickup Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-3.5 h-5 w-5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Where are you?"
                    className="w-full h-12 rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-3 text-base focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-1">Drop-off Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-3.5 h-5 w-5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Where to?"
                    className="w-full h-12 rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-3 text-base focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1">Date</label>
                  <input
                    type="date"
                    className="w-full h-12 rounded-xl border border-slate-200 bg-slate-50/50 px-3 text-base focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1">Time</label>
                  <input
                    type="time"
                    className="w-full h-12 rounded-xl border border-slate-200 bg-slate-50/50 px-3 text-base focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-1">Passengers</label>
                <select className="w-full h-12 rounded-xl border border-slate-200 bg-slate-50/50 px-3 text-base focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                  <option>1 Passenger</option>
                  <option>2 Passengers</option>
                  <option>3 Passengers</option>
                  <option>4 Passengers</option>
                  <option>5+ Passengers</option>
                </select>
              </div>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button className="w-full h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all" size="lg">
                  <Search className="mr-2 h-5 w-5" />
                  Search Available Options
                </Button>
              </motion.div>
            </form>

            <div className="flex items-center justify-center gap-4 mt-4 text-xs text-secondary">
              <span className="flex items-center gap-1">
                <Shield className="h-3.5 w-3.5 text-green-600" /> Secure Booking
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-primary" /> 24/7 Support
              </span>
              <span className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5 text-primary" /> Free Cancellation
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
