"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { MessageCircle, Phone, Mail } from "lucide-react";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/trips");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center mb-6">
            <img
              src="/assets/images/africana-logo.svg"
              alt="Africana Mobility Service"
              className="h-12 w-auto"
            />
          </Link>
          <h1 className="text-3xl font-bold text-foreground mb-2">Welcome back</h1>
          <p className="text-secondary">Sign in to your Africana account</p>
        </div>
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-xl p-8 space-y-6"
        >
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Email
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="h-12"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Password
            </label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="h-12"
            />
          </div>
          <Button type="submit" className="w-full" size="lg">
            Sign In
          </Button>
          <p className="text-sm text-secondary text-center">
            Don&apos;t have an account?{" "}
            <Link href="/sign-up" className="text-primary font-medium hover:underline">
              Sign up
            </Link>
          </p>
        </motion.form>
        <div className="mt-6 grid grid-cols-3 gap-3">
          <div className="flex items-center justify-center gap-2 text-xs text-secondary bg-white rounded-xl border border-border p-3">
            <Phone className="h-4 w-4 text-primary" />
            <span>Call</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-xs text-secondary bg-white rounded-xl border border-border p-3">
            <MessageCircle className="h-4 w-4 text-green-600" />
            <span>WhatsApp</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-xs text-secondary bg-white rounded-xl border border-border p-3">
            <Mail className="h-4 w-4 text-primary" />
            <span>Email</span>
          </div>
        </div>
      </div>
    </div>
  );
}
