"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, Info, Phone, Shield, Clock, Star } from "lucide-react";

const ACCRA_RATES = [
  { duration: "Hourly hire", rate: "GHS 250", limit: "Accra metropolitan area", note: "Minimum 2 hours", popular: false },
  { duration: "Half day", rate: "GHS 600", limit: "Up to 80 km", note: "Up to 5 hours", popular: false },
  { duration: "Full day", rate: "GHS 1,200", limit: "Up to 150 km", note: "Up to 10 hours", popular: true },
  { duration: "Airport transfer", rate: "From GHS 300", limit: "One way within Accra", note: "Final price by pickup zone", popular: false },
];

const TOURISM_RATES = [
  { destination: "Aburi and Akuapem Ridge", use: "Day trip", rate: "GHS 1,200", basis: "Return from Accra" },
  { destination: "Akosombo", use: "Day trip", rate: "GHS 1,400", basis: "Return from Accra" },
  { destination: "Ada Foah", use: "Day trip", rate: "GHS 1,400", basis: "Return from Accra" },
  { destination: "Cape Coast", use: "Day trip", rate: "GHS 1,600", basis: "Return from Accra" },
  { destination: "Cape Coast and Elmina", use: "Day trip", rate: "GHS 1,600", basis: "Return from Accra" },
  { destination: "Cape Coast and Kakum", use: "Extended day", rate: "GHS 1,600", basis: "Return from Accra" },
  { destination: "Ho or nearby Volta sites", use: "Day / overnight", rate: "GHS 1,600", basis: "Per travel day" },
  { destination: "Kumasi", use: "Day / overnight", rate: "GHS 2,200", basis: "Per travel day" },
  { destination: "Wli and eastern Volta", use: "Overnight recommended", rate: "GHS 2,200", basis: "First travel day" },
  { destination: "Other location", use: "Custom itinerary", rate: "Quotation", basis: "Distance and schedule" },
];

const EXTRA_CHARGES = [
  { charge: "Extra time", rate: "GHS 180 per hour", when: "After booked period. Charged per started hour." },
  { charge: "Overnight driver duty", rate: "GHS 300 per night", when: "Added for each authorised night away from Accra." },
  { charge: "Excess distance", rate: "GHS 8 per km", when: "Beyond the included Accra kilometere limit." },
  { charge: "Late night duty", rate: "GHS 200", when: "Duty substantially between 10:00 pm and 5:00 am." },
  { charge: "Parking and tolls", rate: "Actual cost", when: "Paid by customer or added with evidence." },
];

const TRUST_POINTS = [
  { icon: Shield, text: "All drivers are identity-verified" },
  { icon: Clock, text: "24/7 customer support" },
  { icon: Star, text: "Transparent pricing with no hidden fees" },
  { icon: Phone, text: "Real-time tracking available" },
];

export default function PricingPage() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <main className="min-h-screen">
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 to-white pb-16 pt-16 md:pt-24">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 h-[600px] w-[1200px] -translate-x-1/2 bg-gradient-to-b from-primary/5 via-primary/3 to-transparent blur-3xl" />
        </div>

        <div className="container mx-auto px-4 md:px-6">
          <motion.div
            initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
            animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-3xl text-center mb-12"
          >
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/10">Pricing</Badge>
            <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl mb-4">
              Chauffeur Driven Vehicle Hire
            </h1>
            <p className="text-lg text-secondary max-w-2xl mx-auto leading-relaxed">
              Transparent pricing for Accra hires, airport transfers, and popular tourism destinations across Ghana.
            </p>
          </motion.div>

          <motion.div
            initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
            animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16"
          >
            {TRUST_POINTS.map((item, index) => (
              <div key={item.text} className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-border shadow-sm">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <span className="text-sm font-medium text-foreground">{item.text}</span>
              </div>
            ))}
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-16">
            {ACCRA_RATES.map((item, index) => (
              <motion.div
                key={item.duration}
                initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
                animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
                transition={shouldReduceMotion ? {} : { duration: 0.5, delay: index * 0.1 }}
              >
                <Card className={`h-full border border-border/70 shadow-sm hover:shadow-lg transition-all ${item.popular ? "ring-2 ring-primary" : ""}`}>
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{item.duration}</CardTitle>
                      {item.popular && <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <span className="text-3xl font-bold text-primary">{item.rate}</span>
                    </div>
                    <div className="space-y-2 text-sm text-secondary">
                      <div className="flex items-start gap-2">
                        <Info className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
                        <span>{item.limit}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{item.note}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
            animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mx-auto max-w-5xl mb-16"
          >
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-foreground md:text-4xl mb-4">Popular Tourism &amp; Intercity Rates</h2>
              <p className="text-lg text-secondary max-w-2xl mx-auto">
                Fixed rates for return trips from Accra to Ghana&apos;s top destinations.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-border">
                      <th className="text-left px-6 py-4 font-semibold text-foreground">Destination</th>
                      <th className="text-left px-6 py-4 font-semibold text-foreground">Typical Use</th>
                      <th className="text-left px-6 py-4 font-semibold text-foreground">Rate</th>
                      <th className="text-left px-6 py-4 font-semibold text-foreground">Trip Basis</th>
                    </tr>
                  </thead>
                  <tbody>
                    {TOURISM_RATES.map((row, index) => (
                      <tr key={row.destination} className={index % 2 === 0 ? "bg-white" : "bg-slate-50/50"}>
                        <td className="px-6 py-4 font-medium text-foreground">{row.destination}</td>
                        <td className="px-6 py-4 text-secondary">{row.use}</td>
                        <td className="px-6 py-4 font-semibold text-primary">{row.rate}</td>
                        <td className="px-6 py-4 text-secondary">{row.basis}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
            animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mx-auto max-w-5xl mb-16"
          >
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-foreground md:text-4xl mb-4">Extra Driver &amp; Trip Charges</h2>
              <p className="text-lg text-secondary max-w-2xl mx-auto">
                Additional charges that may apply depending on your trip requirements.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {EXTRA_CHARGES.map((item, index) => (
                <motion.div
                  key={item.charge}
                  initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
                  animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
                  transition={shouldReduceMotion ? {} : { duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="h-full border border-border/70 shadow-sm hover:shadow-md transition-all">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <h3 className="font-semibold text-foreground">{item.charge}</h3>
                        <Badge variant="outline" className="shrink-0">{item.rate}</Badge>
                      </div>
                      <p className="text-sm text-secondary">{item.when}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <Separator className="my-12" />

          <motion.div
            initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
            animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mx-auto max-w-3xl"
          >
            <Card className="border border-border/70 shadow-sm">
              <CardContent className="p-8">
                <h3 className="text-xl font-bold text-foreground mb-6">Fuel &amp; Oil Requirements</h3>
                <div className="space-y-4 text-secondary">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                    <p>Fuel is excluded. The vehicle starts the assignment with a full tank. The customer funds all fuel used during the trip and must return the vehicle with the tank refilled to full.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                    <p>If the tank is not restored to full, the actual refill cost plus a GHS 100 refuelling service charge will be added to the final bill.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                    <p>Routine servicing and scheduled oil changes remain the operator&apos;s responsibility. Only a trip-specific oil or approved lubricant top-up authorised by Africana Mobility Service may be recharged at documented actual cost.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                    <p>Opening and closing fuel levels, odometer readings and any authorised top-up will be recorded on the trip sheet.</p>
                  </div>
                </div>

                <Separator className="my-8" />

                <h3 className="text-xl font-bold text-foreground mb-4">Booking Notes</h3>
                <div className="space-y-3 text-secondary text-sm">
                  <p>Driver included; fuel, tickets, parking, tolls and accommodation excluded unless stated. A 50% deposit confirms booking. Extra stops, route changes, waiting, multi-day and cross-border work may require a revised quotation. Final written quotation and vehicle availability apply.</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
            animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mx-auto max-w-3xl mt-12 text-center"
          >
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link href="/book">
                  <Button size="lg" className="font-semibold shadow-lg hover:shadow-xl transition-all">
                    Book Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <a href="tel:+233557121018">
                  <Button size="lg" variant="outline" className="font-semibold">
                    <Phone className="mr-2 h-5 w-5" />
                    Call Us
                  </Button>
                </a>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
