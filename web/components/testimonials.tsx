"use client";

import { Star } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

const TESTIMONIALS = [
  {
    id: 1,
    author: "Sarah Mensah",
    title: "Client, Accra",
    body: "Africana Mobility Service made booking a vehicle so easy. The driver was punctual, professional, and the car was in excellent condition. Highly recommended!",
    rating: 5,
  },
  {
    id: 2,
    author: "Kwame Asante",
    title: "Driver, Kumasi",
    body: "Since joining Africana Mobility Service, I've had consistent bookings and the platform is easy to use. The verification process gave me credibility with clients.",
    rating: 5,
  },
  {
    id: 3,
    author: "Ama Osei",
    title: "Corporate Client, Accra",
    body: "Managing our company's transport needs used to be a headache. Africana Mobility Service's corporate features streamlined everything. Excellent service!",
    rating: 5,
  },
];

export function Testimonials() {
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
          <span className="text-primary font-semibold text-sm uppercase tracking-widest">Testimonials</span>
          <h2 className="text-3xl font-bold text-foreground md:text-4xl mt-2 mb-4">
            What Our Users Say
          </h2>
          <p className="text-lg text-secondary leading-relaxed">
            Don&apos;t just take our word for it. Here&apos;s what our community has to say.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={shouldReduceMotion ? {} : { opacity: 0, y: 30 }}
              whileInView={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={shouldReduceMotion ? {} : { duration: 0.5, delay: index * 0.1 }}
            >
              <div className="h-full bg-white rounded-2xl border border-border/70 shadow-sm hover:shadow-lg transition-all p-6 md:p-8">
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-secondary leading-relaxed mb-6 flex-1">
                  &ldquo;{testimonial.body}&rdquo;
                </p>
                <div className="flex items-center gap-3 pt-4 border-t border-border/50">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">
                      {testimonial.author.split(" ").map(n => n[0]).join("")}
                    </span>
                  </div>
                  <div>
                    <div className="font-semibold text-foreground text-sm">{testimonial.author}</div>
                    <div className="text-xs text-secondary">{testimonial.title}</div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
