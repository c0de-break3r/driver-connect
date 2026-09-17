"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlaneTakeoff, PlaneLanding, Car, Users, CheckCircle2 } from "lucide-react";
import { motion, useReducedMotion, useMotionValue, useSpring } from "motion/react";

const SERVICES = [
  {
    icon: <PlaneTakeoff className="h-6 w-6" />,
    title: "Airport Pickup",
    description: "Meet & greet at arrivals with flight tracking and name board service.",
    color: "bg-primary",
    href: "/book?service=airport-pickup",
    buttonText: "Book Pickup",
    image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=600&q=80",
  },
  {
    icon: <PlaneLanding className="h-6 w-6" />,
    title: "Airport Drop-off",
    description: "Doorstep pickup with on-time guarantee and air-conditioned vehicles.",
    color: "bg-amber-500",
    href: "/book?service=airport-dropoff",
    buttonText: "Book Drop-off",
    image: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=600&q=80",
  },
  {
    icon: <Car className="h-6 w-6" />,
    title: "Vehicle Rental",
    description: "Daily hire rates for sedans, SUVs and minivans — with or without driver.",
    color: "bg-purple-600",
    href: "/browse/vehicles",
    buttonText: "Browse Vehicles",
    image: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=600&q=80",
  },
  {
    icon: <Users className="h-6 w-6" />,
    title: "Find a Driver",
    description: "Identity-verified, background-checked professionals for any route.",
    color: "bg-green-600",
    href: "/browse/drivers",
    buttonText: "Find Drivers",
    image: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=600&q=80",
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
            From airport transfers to daily vehicle rental, we&apos;ve got your transport needs covered.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {SERVICES.map((service, index) => (
            <motion.div
              key={service.title}
              initial={shouldReduceMotion ? {} : { opacity: 0, y: 30 }}
              whileInView={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={shouldReduceMotion ? {} : { duration: 0.5, delay: index * 0.1 }}
            >
              <TiltCard className="h-full">
                <Card className="h-full overflow-hidden border border-border/70 shadow-sm hover:shadow-2xl transition-all group">
                  <div className="aspect-[16/10] overflow-hidden bg-slate-100 relative">
                    <img
                      src={service.image}
                      alt={service.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute bottom-3 left-3">
                      <div className={`w-10 h-10 ${service.color} rounded-lg flex items-center justify-center text-white`}>
                        {service.icon}
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-foreground mb-2">{service.title}</h3>
                    <p className="text-secondary text-sm leading-relaxed mb-6">{service.description}</p>
                    <Link href={service.href}>
                      <Button className={`${service.color} text-white hover:opacity-90 font-semibold w-full`}>
                        {service.buttonText} →
                      </Button>
                    </Link>
                  </div>
                </Card>
              </TiltCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
