"use client";
import { Button } from "@/components/ui/button";
export default function BookingError({ reset }: { reset: () => void }) {
  return (
    <div className="max-w-xl mx-auto p-8 space-y-4" role="alert">
      <h1 className="text-2xl font-bold">
        Bookings are temporarily unavailable
      </h1>
      <p>We couldn’t load the booking service. Please try again.</p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
