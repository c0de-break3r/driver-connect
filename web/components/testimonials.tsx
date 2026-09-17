"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";
import { motion, useReducedMotion, AnimatePresence } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";

const TESTIMONIALS = [
  {
    id: 1,
    author: "Sarah Mensah",
    title: "Client, Accra",
    body: "Africana made booking a vehicle so easy. The driver was punctual, professional, and the car was in excellent condition. Highly recommended!",
    rating: 5,
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80",
  },
  {
    id: 2,
    author: "Kwame Asante",
    title: "Driver, Kumasi",
    body: "Since joining Africana, I have had consistent bookings and the platform is easy to use. The verification process gave me credibility with clients.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80",
  },
  {
    id: 3,
    author: "Ama Osei",
    title: "Corporate Client, Accra",
    body: "Managing our transport needs used to be a headache. Africana streamlined everything. Excellent service!",
    rating: 5,
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80",
  },
  {
    id: 4,
    author: "Kofi Mensah",
    title: "Driver, Accra",
    body: "Professional, reliable, and easy to use. Africana has transformed how I find clients and manage my schedule.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80",
  },
  {
    id: 5,
    author: "Abena Serwaa",
    title: "Client, Kumasi",
    body: "The best transport service I have used in Ghana. Always on time, clean vehicles, and professional drivers.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80",
  },
  {
    id: 6,
    author: "Yaw Boateng",
    title: "Corporate Client, Accra",
    body: "We use Africana for all our corporate transport needs. Excellent service and very responsive support team.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f15?w=200&q=80",
  },
];

function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}

export function Testimonials() {
  const shouldReduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = useCallback((next: number) => {
    setDirection(next > index ? 1 : -1);
    setIndex(next);
  }, [index]);

  const goNext = useCallback(() => {
    goTo((index + 1) % TESTIMONIALS.length);
  }, [index, goTo]);

  const goPrev = useCallback(() => {
    goTo((index - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  }, [index, goTo]);

  useEffect(() => {
    if (isPaused) return;
    timerRef.current = setInterval(goNext, 5000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [goNext, isPaused]);

  const active = TESTIMONIALS[index];

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
            Real experiences from people who trust Africana.
          </p>
        </motion.div>

        <div
          className="relative"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="overflow-hidden">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={active.id}
                custom={direction}
                variants={{
                  enter: (dir: number) => ({ x: dir > 0 ? 320 : -320, opacity: 0 }),
                  center: { x: 0, opacity: 1 },
                  exit: (dir: number) => ({ x: dir > 0 ? -320 : 320, opacity: 0 }),
                }}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.35, ease: "easeInOut" }}
                className="max-w-3xl mx-auto"
              >
                <Card className="border border-border/70 shadow-xl">
                  <CardContent className="p-8 md:p-10">
                    <div className="flex items-center gap-1 mb-5">
                      {Array.from({ length: active.rating }).map((_, i) => (
                        <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <p className="text-secondary leading-relaxed mb-8 text-lg">
                      &ldquo;{active.body}&rdquo;
                    </p>
                    <div className="flex items-center gap-4 pt-4 border-t border-border/50">
                      <img
                        src={active.image}
                        alt={active.author}
                        className="h-12 w-12 rounded-full object-cover border border-border"
                      />
                      <div>
                        <div className="font-semibold text-foreground">{active.author}</div>
                        <div className="text-sm text-secondary">{active.title}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={goPrev}
              className="h-12 w-12 rounded-full border-2 border-primary text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
              aria-label="Previous testimonial"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              {TESTIMONIALS.map((t, i) => (
                <button
                  key={t.id}
                  onClick={() => goTo(i)}
                  className={`h-2.5 rounded-full transition-all ${i === index ? "w-8 bg-primary" : "w-2.5 bg-slate-300 hover:bg-slate-400"}`}
                  aria-label={`Go to testimonial ${i + 1}`}
                />
              ))}
            </div>
            <button
              onClick={goNext}
              className="h-12 w-12 rounded-full border-2 border-primary text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
              aria-label="Next testimonial"
            >
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
