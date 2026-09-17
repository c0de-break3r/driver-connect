"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Phone, MessageCircle, Mail, MapPin, Clock } from "lucide-react";

const FOOTER_LINKS = {
  services: [
    { href: "/browse/vehicles", label: "Browse Vehicles" },
    { href: "/browse/drivers", label: "Find Drivers" },
    { href: "/book", label: "Book a Ride" },
    { href: "/pricing", label: "Pricing" },
  ],
  company: [
    { href: "/about", label: "About Us" },
    { href: "/blog", label: "Blog" },
    { href: "/contact", label: "Contact" },
    { href: "/privacy", label: "Privacy Policy" },
  ],
  support: [
    { href: "/sign-in", label: "Help Center" },
    { href: "/sign-in", label: "Track Booking" },
    { href: "/contact", label: "Contact Support" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-[#0a1628] text-white">
      <div className="container mx-auto px-4 md:px-6 py-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="flex items-center gap-3 mb-4">
              <img
                src="/assets/images/africana-logo.svg"
                alt="Africana Mobility Service"
                className="h-10 w-auto"
              />
            </Link>
            <p className="text-sm text-white/70 leading-relaxed mb-6">
              Ghana&apos;s most trusted mobility platform. Verified drivers, quality vehicles, and secure booking — available 24/7.
            </p>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-white/10 flex items-center justify-center">
                <span className="text-xs font-bold text-white/80">M-Pesa</span>
              </div>
              <div className="h-10 w-10 rounded-lg bg-white/10 flex items-center justify-center">
                <span className="text-xs font-bold text-white/80">MTN</span>
              </div>
              <div className="h-10 w-10 rounded-lg bg-white/10 flex items-center justify-center">
                <span className="text-xs font-bold text-white/80">Airtel</span>
              </div>
              <div className="h-10 w-10 rounded-lg bg-white/10 flex items-center justify-center">
                <span className="text-xs font-bold text-white/80">VISA</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-white">Services</h4>
            <ul className="space-y-3 text-sm text-white/70">
              {FOOTER_LINKS.services.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-[#f59e0b] transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-white">Company</h4>
            <ul className="space-y-3 text-sm text-white/70">
              {FOOTER_LINKS.company.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-[#f59e0b] transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-white">Support</h4>
            <ul className="space-y-3 text-sm text-white/70">
              {FOOTER_LINKS.support.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-[#f59e0b] transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-6">
              <Link href="/sign-up">
                <Button size="sm" className="w-full bg-[#f59e0b] hover:bg-[#d97706] text-[#0a1628] font-semibold border-0">
                  Become a Driver
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <Separator className="my-8 bg-white/10" />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="flex items-center gap-3 text-sm text-white/70">
            <Phone className="h-4 w-4 text-[#f59e0b] shrink-0" />
            <span>+233 30 299 9999</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-white/70">
            <MessageCircle className="h-4 w-4 text-[#f59e0b] shrink-0" />
            <span>WhatsApp: +233 244 000 244</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-white/70">
            <Mail className="h-4 w-4 text-[#f59e0b] shrink-0" />
            <span>hello@africana-mobility.com</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-white/70">
            <MapPin className="h-4 w-4 text-[#f59e0b] shrink-0" />
            <span>Accra, Ghana</span>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-white/50">
          <p>© {new Date().getFullYear()} Africana Mobility Service. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-[#f59e0b] transition-colors">Privacy Policy</Link>
            <Link href="/privacy" className="hover:text-[#f59e0b] transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
