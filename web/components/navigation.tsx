"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";

export function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-white/95 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-3">
          <img
            src="/assets/images/africana-logo.svg"
            alt="Africana Mobility Service"
            className="h-9 w-auto"
          />
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link href="/browse/vehicles" className="text-secondary hover:text-primary transition-colors">
            Vehicles
          </Link>
          <Link href="/browse/drivers" className="text-secondary hover:text-primary transition-colors">
            Drivers
          </Link>
          <Link href="/pricing" className="text-secondary hover:text-primary transition-colors">
            Pricing
          </Link>
          <Link href="/book" className="text-secondary hover:text-primary transition-colors">
            Book Now
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/sign-in" className="hidden sm:block">
            <Button variant="ghost" size="sm" className="font-medium">Sign In</Button>
          </Link>
          <Link href="/sign-up" className="hidden sm:block">
            <Button size="sm" className="font-medium bg-gold text-primary hover:bg-gold/90 shadow-sm hover:shadow-md transition-all">
              Get Started
            </Button>
          </Link>
          <motion.button
            className="md:hidden p-2 -mr-2 text-secondary hover:text-primary transition-colors rounded-lg hover:bg-slate-100"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
            whileTap={{ scale: 0.95 }}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.nav
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="md:hidden border-t border-border bg-white/98 backdrop-blur-md z-50"
            >
              <div className="container mx-auto flex flex-col gap-1 px-4 py-6">
                <Link href="/browse/vehicles" className="text-base font-medium text-secondary hover:text-primary py-3 px-2 rounded-lg hover:bg-slate-50" onClick={() => setMobileMenuOpen(false)}>
                  Vehicles
                </Link>
                <Link href="/browse/drivers" className="text-base font-medium text-secondary hover:text-primary py-3 px-2 rounded-lg hover:bg-slate-50" onClick={() => setMobileMenuOpen(false)}>
                  Drivers
                </Link>
                <Link href="/pricing" className="text-base font-medium text-secondary hover:text-primary py-3 px-2 rounded-lg hover:bg-slate-50" onClick={() => setMobileMenuOpen(false)}>
                  Pricing
                </Link>
                <Link href="/book" className="text-base font-medium text-secondary hover:text-primary py-3 px-2 rounded-lg hover:bg-slate-50" onClick={() => setMobileMenuOpen(false)}>
                  Book Now
                </Link>

                <div className="h-px bg-border my-2" />

                <Link href="/sign-in" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full">Sign In</Button>
                </Link>
                <Link href="/sign-up" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full bg-gold text-primary hover:bg-gold/90 shadow-sm">Get Started</Button>
                </Link>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
