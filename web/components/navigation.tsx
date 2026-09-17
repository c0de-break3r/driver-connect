"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";

const SERVICES = [
  { href: "/browse/vehicles", label: "Browse Vehicles", icon: "🚗" },
  { href: "/browse/drivers", label: "Find Drivers", icon: "👤" },
  { href: "/book", label: "Book a Ride", icon: "📅" },
  { href: "/browse/vehicles", label: "Vehicle Rental", icon: "🚙" },
];

const COMPANY = [
  { href: "/about", label: "About Us" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
];

const PARTNERS = [
  { href: "/sign-up?role=driver", label: "Become a Driver", subtitle: "Join our driver network", icon: "🪪" },
  { href: "/sign-up?role=owner", label: "List Your Vehicle", subtitle: "Earn from your fleet", icon: "🚐" },
];

export function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [companyOpen, setCompanyOpen] = useState(false);
  const [partnersOpen, setPartnersOpen] = useState(false);

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
            className="h-10 w-auto"
          />
        </Link>

        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium">
          <Link href="/browse/vehicles" className="text-secondary hover:text-primary transition-colors">
            Vehicles
          </Link>
          <Link href="/browse/drivers" className="text-secondary hover:text-primary transition-colors">
            Drivers
          </Link>
          <Link href="/book" className="text-secondary hover:text-primary transition-colors">
            Book Now
          </Link>

          <div className="relative">
            <button
              className="flex items-center gap-1 text-secondary hover:text-primary transition-colors"
              onClick={() => setServicesOpen(!servicesOpen)}
            >
              Services <ChevronDown className={`h-3.5 w-3.5 transition-transform ${servicesOpen ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence>
              {servicesOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-border z-50"
                >
                  {SERVICES.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors"
                      onClick={() => setServicesOpen(false)}
                    >
                      <span className="text-base">{item.icon}</span>
                      <span className="text-sm text-secondary">{item.label}</span>
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="relative">
            <button
              className="flex items-center gap-1 text-secondary hover:text-primary transition-colors"
              onClick={() => setCompanyOpen(!companyOpen)}
            >
              Company <ChevronDown className={`h-3.5 w-3.5 transition-transform ${companyOpen ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence>
              {companyOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-border z-50"
                >
                  {COMPANY.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="block px-4 py-3 hover:bg-slate-50 transition-colors"
                      onClick={() => setCompanyOpen(false)}
                    >
                      <span className="text-sm text-secondary">{item.label}</span>
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="relative">
            <button
              className="flex items-center gap-1 font-semibold text-primary hover:text-primary/80 transition-colors"
              onClick={() => setPartnersOpen(!partnersOpen)}
            >
              Partners <ChevronDown className={`h-3.5 w-3.5 transition-transform ${partnersOpen ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence>
              {partnersOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-border z-50"
                >
                  {PARTNERS.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors"
                      onClick={() => setPartnersOpen(false)}
                    >
                      <span className="text-base">{item.icon}</span>
                      <div>
                        <div className="text-sm font-semibold text-secondary">{item.label}</div>
                        <div className="text-xs text-muted-foreground">{item.subtitle}</div>
                      </div>
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/sign-in" className="hidden sm:block">
            <Button variant="ghost" size="sm" className="font-medium">Sign In</Button>
          </Link>
          <Link href="/sign-up" className="hidden sm:block">
            <Button size="sm" className="font-medium">Get Started</Button>
          </Link>
          <motion.button
            className="lg:hidden p-2 -mr-2 text-secondary hover:text-primary transition-colors rounded-lg hover:bg-slate-100"
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
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.nav
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="lg:hidden border-t border-border bg-white/98 backdrop-blur-md z-50"
            >
              <div className="container mx-auto flex flex-col gap-1 px-4 py-6">
                <Link href="/browse/vehicles" className="text-base font-medium text-secondary hover:text-primary py-3 px-2 rounded-lg hover:bg-slate-50" onClick={() => setMobileMenuOpen(false)}>
                  Vehicles
                </Link>
                <Link href="/browse/drivers" className="text-base font-medium text-secondary hover:text-primary py-3 px-2 rounded-lg hover:bg-slate-50" onClick={() => setMobileMenuOpen(false)}>
                  Drivers
                </Link>
                <Link href="/book" className="text-base font-medium text-secondary hover:text-primary py-3 px-2 rounded-lg hover:bg-slate-50" onClick={() => setMobileMenuOpen(false)}>
                  Book Now
                </Link>

                <div className="h-px bg-border my-2" />

                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 px-2">Services</div>
                {SERVICES.map((item) => (
                  <Link key={item.href} href={item.href} className="flex items-center gap-3 py-2.5 px-2 rounded-lg hover:bg-slate-50" onClick={() => setMobileMenuOpen(false)}>
                    <span>{item.icon}</span>
                    <span className="text-sm text-secondary">{item.label}</span>
                  </Link>
                ))}

                <div className="h-px bg-border my-2" />

                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 px-2">Partners</div>
                {PARTNERS.map((item) => (
                  <Link key={item.href} href={item.href} className="flex items-center gap-3 py-2.5 px-2 rounded-lg hover:bg-slate-50" onClick={() => setMobileMenuOpen(false)}>
                    <span>{item.icon}</span>
                    <div>
                      <div className="text-sm font-semibold text-primary">{item.label}</div>
                      <div className="text-xs text-muted-foreground">{item.subtitle}</div>
                    </div>
                  </Link>
                ))}

                <div className="h-px bg-border my-2" />

                <Link href="/sign-in" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full">Sign In</Button>
                </Link>
                <Link href="/sign-up" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full">Get Started</Button>
                </Link>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
