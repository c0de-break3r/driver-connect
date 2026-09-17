"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import {
  Car,
  PlaneTakeoff,
  PlaneLanding,
  Calendar,
  Clock,
  Users,
  Luggage,
  Phone,
  Mail,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";

type ServiceType = "pickup" | "dropoff" | "rental";

const STEPS = [
  { id: 1, label: "Service" },
  { id: 2, label: "Journey" },
  { id: 3, label: "Details" },
  { id: 4, label: "Vehicle" },
  { id: 5, label: "Payment" },
] as const;

const SERVICE_OPTIONS: { key: ServiceType; label: string; icon: typeof Car; description: string }[] = [
  { key: "pickup", label: "Airport Pickup", icon: PlaneTakeoff, description: "We meet you at arrivals" },
  { key: "dropoff", label: "Airport Drop-off", icon: PlaneLanding, description: "Doorstep pickup to airport" },
  { key: "rental", label: "Car Rental", icon: Car, description: "Daily hire with or without driver" },
];

const VEHICLES = [
  { id: "1", name: "Toyota Voxy Minivan", type: "Minivan", seats: 7, bags: 5, price: 800, image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=600&q=80" },
  { id: "2", name: "Toyota Hiace VAN", type: "Economy Sedan", seats: 14, bags: 10, price: 1500, image: "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=600&q=80" },
  { id: "3", name: "Toyota Landcruiser V8", type: "SUV", seats: 7, bags: 6, price: 2200, image: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=600&q=80" },
  { id: "4", name: "Executive Sedan", type: "Sedan", seats: 4, bags: 2, price: 1200, image: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=600&q=80" },
];

export default function BookPage() {
  const [step, setStep] = useState(1);
  const [serviceType, setServiceType] = useState<ServiceType>("pickup");
  const [direction, setDirection] = useState(0);

  const next = () => {
    setDirection(1);
    setStep((s) => Math.min(s + 1, STEPS.length));
  };
  const prev = () => {
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 1));
  };

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -300 : 300, opacity: 0 }),
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-3xl font-bold text-foreground md:text-5xl mb-2">Book Your Ride</h1>
            <p className="text-lg text-secondary mb-8">Complete the steps below to confirm your booking.</p>
          </motion.div>

          <div className="flex items-center justify-between mb-8">
            {STEPS.map((s, i) => (
              <div key={s.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${
                      step >= s.id ? "bg-primary text-primary-foreground border-primary" : "bg-white text-secondary border-border"
                    }`}
                  >
                    {s.id}
                  </div>
                  <span className={`text-xs mt-2 font-medium ${step >= s.id ? "text-primary" : "text-secondary"}`}>{s.label}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 transition-all ${step > s.id ? "bg-primary" : "bg-border"}`} />
                )}
              </div>
            ))}
          </div>

          <motion.div
            className="bg-white rounded-2xl border border-border shadow-xl p-6 md:p-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={step}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                {step === 1 && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-bold text-foreground mb-4">Select Service Type</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {SERVICE_OPTIONS.map((option) => {
                        const Icon = option.icon;
                        return (
                          <button
                            key={option.key}
                            onClick={() => setServiceType(option.key)}
                            className={`p-6 rounded-xl border-2 text-center transition-all hover:border-primary/50 ${
                              serviceType === option.key ? "border-primary bg-primary/5" : "border-border"
                            }`}
                          >
                            <Icon className={`h-8 w-8 mx-auto mb-3 ${serviceType === option.key ? "text-primary" : "text-secondary"}`} />
                            <div className="font-semibold text-foreground mb-1">{option.label}</div>
                            <div className="text-xs text-secondary">{option.description}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-bold text-foreground mb-4">Journey Details</h2>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        {serviceType === "pickup" ? "Arrival Airport" : "Departure Airport"}
                      </label>
                      <div className="relative">
                        <PlaneTakeoff className="absolute left-3.5 top-3.5 h-5 w-5 text-muted-foreground" />
                        <select className="w-full h-12 rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-3 text-base">
                          <option>Accra International Airport – ACC</option>
                          <option>Kumasi Airport – KMS</option>
                          <option>Tamale Airport – TML</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Drop-off / Pickup Address</label>
                      <div className="relative">
                        <MapPin className="absolute left-3.5 top-3.5 h-5 w-5 text-muted-foreground" />
                        <input type="text" placeholder="Enter address" className="w-full h-12 rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-3 text-base" />
                      </div>
                    </div>
                    {serviceType === "pickup" && (
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Flight Number</label>
                        <input type="text" placeholder="e.g. KLM 598" className="w-full h-12 rounded-xl border border-slate-200 bg-slate-50/50 px-3 text-base" />
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Date</label>
                        <div className="relative">
                          <Calendar className="absolute left-3.5 top-3.5 h-5 w-5 text-muted-foreground" />
                          <input type="date" className="w-full h-12 rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-3 text-base" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Time</label>
                        <div className="relative">
                          <Clock className="absolute left-3.5 top-3.5 h-5 w-5 text-muted-foreground" />
                          <input type="time" className="w-full h-12 rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-3 text-base" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-bold text-foreground mb-4">Passenger & Luggage</h2>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Passengers</label>
                      <div className="relative">
                        <Users className="absolute left-3.5 top-3.5 h-5 w-5 text-muted-foreground" />
                        <select className="w-full h-12 rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-3 text-base">
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                            <option key={n}>{n} Passenger{n > 1 ? "s" : ""}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Luggage Items</label>
                      <div className="relative">
                        <Luggage className="absolute left-3.5 top-3.5 h-5 w-5 text-muted-foreground" />
                        <select className="w-full h-12 rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-3 text-base">
                          {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                            <option key={n}>
                              {n} {n === 1 ? "Bag" : "Bags"}
                              {n >= 3 ? " (extra charge)" : ""}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Your Name</label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-3.5 h-5 w-5 text-muted-foreground" />
                        <input type="text" placeholder="Full name" className="w-full h-12 rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-3 text-base" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Phone Number</label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-3.5 h-5 w-5 text-muted-foreground" />
                        <input type="tel" placeholder="+233..." className="w-full h-12 rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-3 text-base" />
                      </div>
                    </div>
                  </div>
                )}

                {step === 4 && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-bold text-foreground mb-4">Choose Vehicle</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {VEHICLES.map((vehicle) => (
                        <button
                          key={vehicle.id}
                          className="p-4 rounded-xl border-2 border-border text-left hover:border-primary/50 transition-all"
                        >
                          <div className="aspect-video rounded-lg overflow-hidden bg-slate-100 mb-3">
                            <img src={vehicle.image} alt={vehicle.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="font-semibold text-foreground text-sm mb-1">{vehicle.name}</div>
                          <div className="text-xs text-secondary mb-2">{vehicle.type}</div>
                          <div className="flex items-center gap-3 text-xs text-secondary">
                            <span className="flex items-center gap-1">
                              <Users className="h-3.5 w-3.5" />
                              {vehicle.seats}
                            </span>
                            <span className="flex items-center gap-1">
                              <Luggage className="h-3.5 w-3.5" />
                              {vehicle.bags}
                            </span>
                          </div>
                          <div className="mt-2 text-sm font-bold text-primary">GHS {vehicle.price}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {step === 5 && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-bold text-foreground mb-4">Payment Method</h2>
                    <div className="space-y-3">
                      {["Pay Online Now (Card / Mobile Money)", "Pay on Arrival (Cash)"].map((method) => (
                        <button
                          key={method}
                          className="w-full p-4 rounded-xl border-2 border-border text-left hover:border-primary/50 transition-all flex items-center gap-3"
                        >
                          <div className="h-5 w-5 rounded-full border-2 border-primary flex items-center justify-center">
                            <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                          </div>
                          <span className="font-medium text-foreground text-sm">{method}</span>
                        </button>
                      ))}
                    </div>
                    <Separator />
                    <div className="p-4 bg-slate-50 rounded-xl border border-border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-secondary">Estimated Fare</span>
                        <span className="font-bold text-foreground">GHS 0.00</span>
                      </div>
                      <p className="text-xs text-secondary">Final fare will be confirmed before your trip.</p>
                    </div>
                    <Button size="lg" className="w-full">
                      Confirm Booking
                    </Button>
                    <p className="text-xs text-secondary text-center">SSL Secured · Verified by Paystack</p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="flex items-center justify-between mt-6">
              <Button variant="ghost" onClick={prev} disabled={step === 1} className="flex items-center gap-2">
                <ChevronLeft className="h-4 w-4" />
                Back
              </Button>
              {step < STEPS.length ? (
                <Button onClick={next} className="flex items-center gap-2">
                  Continue
                  <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Link href="/trips">
                  <Button className="flex items-center gap-2">
                    View Booking
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
