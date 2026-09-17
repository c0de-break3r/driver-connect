"use client";

import { Separator } from "@/components/ui/separator";
import { motion } from "motion/react";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 md:px-6 py-8 md:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto"
        >
          <h1 className="text-3xl font-bold text-foreground md:text-5xl mb-4">
            Privacy Policy
          </h1>
          <p className="text-secondary mb-8">
            Last updated: September 2025
          </p>
          <div className="prose max-w-none space-y-6 text-secondary bg-white rounded-2xl border border-border shadow-sm p-8">
            <p>
              Your privacy is important to us. This Privacy Policy explains how Africana Mobility Service collects, uses, and protects your personal information.
            </p>
            <Separator />
            <h2 className="text-2xl font-bold text-foreground">Information We Collect</h2>
            <p>
              We collect information you provide directly to us, such as your name, email address, phone number, and payment information when you create an account or make a booking.
            </p>
            <h2 className="text-2xl font-bold text-foreground">How We Use Your Information</h2>
            <p>
              We use the information we collect to provide, maintain, and improve our services, process transactions, and communicate with you about your bookings.
            </p>
            <h2 className="text-2xl font-bold text-foreground">Data Security</h2>
            <p>
              We implement appropriate security measures to protect your personal information from unauthorized access, alteration, or disclosure.
            </p>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
