"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const FOOTER_LINKS = {
  services: [
    { href: "/browse/vehicles", label: "Browse Vehicles" },
    { href: "/browse/drivers", label: "Find Drivers" },
    { href: "/book", label: "Book a Ride" },
    { href: "/browse/vehicles", label: "Vehicle Rental" },
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
    <footer className="border-t border-border bg-white">
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
            <p className="text-sm text-secondary leading-relaxed mb-6">
              Africa&apos;s most trusted mobility platform. Verified drivers, quality vehicles, and secure booking — available 24/7.
            </p>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <span className="text-xs font-bold text-secondary">M-Pesa</span>
              </div>
              <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <span className="text-xs font-bold text-secondary">MTN</span>
              </div>
              <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <span className="text-xs font-bold text-secondary">Airtel</span>
              </div>
              <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <span className="text-xs font-bold text-secondary">VISA</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-foreground">Services</h4>
            <ul className="space-y-3 text-sm text-secondary">
              {FOOTER_LINKS.services.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-foreground">Company</h4>
            <ul className="space-y-3 text-sm text-secondary">
              {FOOTER_LINKS.company.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-foreground">Support</h4>
            <ul className="space-y-3 text-sm text-secondary">
              {FOOTER_LINKS.support.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-6">
              <Link href="/sign-up?role=driver">
                <Button size="sm" className="w-full font-semibold">
                  Become a Driver
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <Separator className="my-8" />
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-secondary">
          <p>© {new Date().getFullYear()} Africana Mobility Service. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link href="/privacy" className="hover:text-primary transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
