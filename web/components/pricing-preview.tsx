"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

const PRICING_PREVIEW = [
  { label: "Hourly hire", rate: "GHS 250", period: "per hour" },
  { label: "Half day", rate: "GHS 600", period: "up to 5 hours" },
  { label: "Full day", rate: "GHS 1,200", period: "up to 10 hours" },
  { label: "Airport transfer", rate: "From GHS 300", period: "one way" },
];

export function PricingPreview() {
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
          <span className="text-primary font-semibold text-sm uppercase tracking-widest">Transparent Pricing</span>
          <h2 className="text-3xl font-bold text-foreground md:text-4xl mt-2 mb-4">Chauffeur Hire Rates</h2>
          <p className="text-lg text-secondary leading-relaxed">
            No hidden fees. Clear rates for Accra hires, airport transfers, and intercity trips.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {PRICING_PREVIEW.map((item, index) => (
            <motion.div
              key={item.label}
              initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
              whileInView={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={shouldReduceMotion ? {} : { duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="h-full border border-border/70 shadow-sm hover:shadow-lg transition-all text-center">
                <CardContent className="p-6">
                  <div className="text-sm font-medium text-secondary mb-2">{item.label}</div>
                  <div className="text-2xl font-bold text-primary mb-1">{item.rate}</div>
                  <div className="text-xs text-muted-foreground">{item.period}</div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center"
        >
          <Link href="/pricing">
            <Button size="lg" variant="outline" className="min-w-[200px]">
              View Full Price List
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
