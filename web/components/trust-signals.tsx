"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

const STATS = [
  { label: "Verified Drivers", value: "500+" },
  { label: "Vehicles Listed", value: "1,200+" },
  { label: "Completed Trips", value: "10,000+" },
  { label: "Happy Customers", value: "8,500+" },
];

const TRUST_POINTS = [
  "All drivers are identity-verified",
  "Secure payment protection",
  "24/7 customer support",
  "Transparent pricing with no hidden fees",
  "Real-time tracking available",
  "Insurance coverage on all trips",
];

export function TrustSignals() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="bg-primary py-20 text-white md:py-28">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="text-3xl font-bold md:text-4xl mb-4">
              Trusted by thousands across Ghana
            </h2>
            <p className="text-white/80 text-lg leading-relaxed mb-10">
              Africana Mobility Service is the most trusted transport marketplace in Ghana, connecting you with verified professionals.
            </p>
            <div className="grid grid-cols-2 gap-4">
              {STATS.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={shouldReduceMotion ? {} : { opacity: 0, scale: 0.9 }}
                  whileInView={shouldReduceMotion ? {} : { opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={shouldReduceMotion ? {} : { duration: 0.4, delay: index * 0.1 }}
                >
                  <Card className="border-white/20 bg-white/10 backdrop-blur">
                    <CardContent className="p-5 text-center">
                      <div className="text-3xl font-bold">{stat.value}</div>
                      <div className="text-sm text-white/80">{stat.label}</div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7 }}
          >
            <h3 className="text-xl font-semibold mb-6">Why Choose Africana Mobility Service?</h3>
            <ul className="space-y-4">
              {TRUST_POINTS.map((point, index) => (
                <motion.li
                  key={point}
                  initial={shouldReduceMotion ? {} : { opacity: 0, x: 20 }}
                  whileInView={shouldReduceMotion ? {} : { opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={shouldReduceMotion ? {} : { duration: 0.4, delay: index * 0.05 }}
                  className="flex items-start gap-3"
                >
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-400" />
                  <span className="text-white/90">{point}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
