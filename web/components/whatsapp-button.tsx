"use client";

import { MessageCircle } from "lucide-react";
import { motion } from "motion/react";

const WHATSAPP_NUMBER = "233557121012";
const WHATSAPP_MESSAGE = "Hello! I need transport service in Ghana.";

export function WhatsAppButton() {
  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-5 py-3.5 rounded-full shadow-2xl transition-colors"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1, type: "spring", stiffness: 200 }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
    >
      <MessageCircle className="h-6 w-6" />
      <span className="font-semibold text-sm hidden sm:inline">Chat with us</span>
    </motion.a>
  );
}
