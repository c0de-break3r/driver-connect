"use client";

import { useState } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin } from "lucide-react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

export default function TripsPage() {
  const { user } = useUser();
  const { isAuthenticated, isLoading } = useConvexAuth();
  const profile = useQuery(
    api.users.getByUserId,
    isAuthenticated && user ? { userId: user.id } : "skip",
  );
  const trips = useQuery(
    api.jobs.getRenterBookings,
    profile ? { renterId: profile._id } : "skip",
  );
  const updateStatus = useMutation(api.jobs.updateBookingStatus);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState<Id<"bookings"> | null>(null);
  const [cancelId, setCancelId] = useState<Id<"bookings"> | null>(null);
  async function cancel(id: Id<"bookings">) {
    setBusy(id);
    setError("");
    try {
      await updateStatus({ bookingId: id, status: "cancelled" });
      setCancelId(null);
    } catch {
      setError(
        "Unable to cancel this request. Refresh the page and try again.",
      );
    } finally {
      setBusy(null);
    }
  }
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 md:px-6 py-8 md:py-12">
        <h1 className="text-3xl font-bold md:text-5xl mb-2">My Trips</h1>
        <p className="text-lg text-secondary mb-8">
          View your booking requests and upcoming trips.
        </p>
        {error && (
          <p role="alert" className="text-red-700 mb-4">
            {error}
          </p>
        )}
        {isLoading ? (
          <p role="status">Checking your account…</p>
        ) : !isAuthenticated ? (
          <Link href="/sign-in" className="underline text-primary">
            Sign in to see your trips
          </Link>
        ) : profile === undefined || (profile && trips === undefined) ? (
          <p role="status">Loading your trips…</p>
        ) : !profile || trips?.length === 0 ? (
          <p className="bg-white border rounded-2xl p-8">
            You haven’t requested any trips yet. Choose a vehicle to get
            started.
          </p>
        ) : (
          <div className="space-y-4">
            {trips
              ?.toSorted((a, b) => b.createdAt - a.createdAt)
              .map((trip) => (
                <article
                  key={trip._id}
                  className="bg-white rounded-2xl border border-border shadow-lg p-6 md:p-8"
                >
                  <div className="flex flex-col md:flex-row md:justify-between gap-4">
                    <div>
                      <h2 className="font-semibold text-lg mb-2">
                        {trip.vehicle.title}
                      </h2>
                      <p className="flex items-center gap-2 mb-2">
                        <MapPin className="h-4 w-4" />
                        {trip.pickupLocation} → {trip.dropoffLocation}
                      </p>
                      <p className="flex items-center gap-2 text-sm text-secondary mb-3">
                        <Calendar className="h-4 w-4" />
                        {trip.startDate} {trip.pickupTime} — {trip.endDate}{" "}
                        {trip.returnTime}
                      </p>
                      <Badge
                        variant={
                          trip.status === "confirmed" ||
                          trip.status === "completed"
                            ? "success"
                            : "warning"
                        }
                      >
                        {trip.status}
                      </Badge>
                      <p className="text-sm mt-3">
                        Payment: {trip.paymentStatus}.{" "}
                        {trip.status === "pending" &&
                          "Waiting for the owner’s response."}
                      </p>
                      {trip.flightNumber && (
                        <p className="text-sm mt-2">
                          Flight: {trip.flightNumber}
                        </p>
                      )}
                      <p className="text-xs text-secondary mt-3 break-all">
                        Booking reference: {trip._id}
                      </p>
                    </div>
                    <div className="md:text-right">
                      <p className="text-2xl font-bold text-primary mb-3">
                        {new Intl.NumberFormat("en-GH", {
                          style: "currency",
                          currency: trip.currency,
                        }).format(trip.totalAmount)}
                      </p>
                      <p className="text-sm text-secondary mb-4">
                        Includes security deposit
                      </p>
                      {["pending", "accepted"].includes(trip.status) &&
                        (cancelId === trip._id ? (
                          <div>
                            <p className="text-sm mb-2">
                              Cancel this booking request?
                            </p>
                            <Button
                              variant="outline"
                              disabled={busy !== null}
                              onClick={() => void cancel(trip._id)}
                            >
                              {busy === trip._id
                                ? "Cancelling…"
                                : "Yes, cancel"}
                            </Button>
                            <Button
                              variant="ghost"
                              onClick={() => setCancelId(null)}
                            >
                              Keep request
                            </Button>
                          </div>
                        ) : (
                          <Button
                            variant="outline"
                            onClick={() => setCancelId(trip._id)}
                          >
                            Cancel request
                          </Button>
                        ))}
                    </div>
                  </div>
                </article>
              ))}
          </div>
        )}
        <div className="mt-8">
          <Link href="/book">
            <Button variant="outline" size="lg">
              Book a New Trip
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
