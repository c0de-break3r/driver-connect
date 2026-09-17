"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlaneTakeoff, PlaneLanding, Car, Users, CheckCircle2 } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

const SERVICES = [
  {
    icon: <PlaneTakeoff className="h-6 w-6" />,
    title: "Airport Pickup",
    description: "We meet you at arrivals and drive you safely to your destination. Flight tracking included — we monitor your arrival so there are no worries about delays.",
    features: ["Meet & greet at arrivals", "Flight tracking & delay monitoring", "Name board pickup service", "Luggage assistance"],
    color: "bg-primary",
    textColor: "text-white",
    accentColor: "bg-primary",
    href: "/book?service=airport-pickup",
    buttonText: "Book Pickup",
  },
  {
    icon: <PlaneLanding className="h-6 w-6" />,
    title: "Airport Drop-off",
    description: "We pick you up from your location and take you to your departure airport — on time for your flight. Arrive stress-free with plenty of time for check-in.",
    features: ["Doorstep pickup anywhere", "On-time guarantee", "Air-conditioned vehicles", "Helpful & professional drivers"],
    color: "bg-amber-500",
    textColor: "text-white",
    accentColor: "bg-amber-500",
    href: "/book?service=airport-dropoff",
    buttonText: "Book Drop-off",
  },
  {
    icon: <Car className="h-6 w-6" />,
    title: "Vehicle Rental",
    description: "Hire a vehicle by the day for business trips, family outings, or extended stays. Choose from our quality fleet — with or without a driver.",
    features: ["Daily hire rates available", "Sedans, SUVs & minivans", "Easy online booking", "Flexible pickup & return"],
    color: "bg-purple-600",
    textColor: "text-white",
    accentColor: "bg-purple-600",
    href: "/browse/vehicles",
    buttonText: "Browse Vehicles",
  },
  {
    icon: <Users className="h-6 w-6" />,
    title: "Find a Driver",
    description: "Need a professional driver? Browse verified drivers ready to take you wherever you need to go. All drivers are identity-verified and background-checked.",
    features: ["Identity-verified drivers", "Background-checked", "Local route expertise", "Professional & punctual"],
    color: "bg-green-600",
    textColor: "text-white",
    accentColor: "bg-green-600",
    href: "/browse/drivers",
    buttonText: "Find Drivers",
  },
];

export function ServicesSection() {
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
          <span className="text-primary font-semibold text-sm uppercase tracking-widest">What We Offer</span>
          <h2 className="text-3xl font-bold text-foreground md:text-4xl mt-2 mb-4">Our Services</h2>
          <p className="text-lg text-secondary leading-relaxed">
            From airport transfers to daily vehicle rental, we&apos;ve got your transport needs covered across Africa.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {SERVICES.map((service, index) => (
            <motion.div
              key={service.title}
              initial={shouldReduceMotion ? {} : { opacity: 0, y: 30 }}
              whileInView={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={shouldReduceMotion ? {} : { duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="h-full overflow-hidden border border-border/70 shadow-sm hover:shadow-xl transition-all group">
                <div className={`h-2 w-full ${service.accentColor}`} />
                <div className="p-8">
                  <div className="flex items-start gap-4 mb-6">
                    <div className={`w-16 h-16 ${service.color} rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                      <div className={service.textColor}>{service.icon}</div>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground mb-1">{service.title}</h3>
                      <p className="text-secondary text-sm leading-relaxed">{service.description}</p>
                    </div>
                  </div>
                  <ul className="space-y-3 text-sm text-secondary mb-8">
                    {service.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href={service.href}>
                    <Button className={`${service.accentColor} ${service.textColor} hover:opacity-90 font-semibold w-full`}>
                      {service.buttonText} →
                    </Button>
                  </Link>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
