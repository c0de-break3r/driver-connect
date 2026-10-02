"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { ConvexError } from "convex/values";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Car,
  PlaneLanding,
  PlaneTakeoff,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import type { BookingService } from "../../../convex/lib/bookingRules";

const STEPS = ["Service", "Journey", "Details", "Vehicle", "Review"];
const SERVICES: {
  key: BookingService;
  label: string;
  description: string;
  icon: typeof Car;
}[] = [
  {
    key: "self_drive",
    label: "Self Drive",
    description: "Rent a vehicle and drive yourself",
    icon: Car,
  },
  {
    key: "with_driver",
    label: "Car + Driver",
    description: "Hire a vehicle with a professional driver",
    icon: Car,
  },
  {
    key: "airport_pickup",
    label: "Airport Pickup",
    description: "Arrange your arrival transport",
    icon: PlaneLanding,
  },
  {
    key: "airport_dropoff",
    label: "Airport Drop-off",
    description: "Arrange transport to your flight",
    icon: PlaneTakeoff,
  },
];
const money = (amount: number) =>
  new Intl.NumberFormat("en-GH", { style: "currency", currency: "GHS" }).format(
    amount,
  );

export default function BookPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useConvexAuth();
  const [step, setStep] = useState(0);
  const [serviceType, setServiceType] = useState<BookingService>("self_drive");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [pickupTime, setPickupTime] = useState("09:00");
  const [returnTime, setReturnTime] = useState("09:00");
  const [pickupLocation, setPickupLocation] = useState("");
  const [dropoffLocation, setDropoffLocation] = useState("");
  const [flightNumber, setFlightNumber] = useState("");
  const [passengers, setPassengers] = useState(1);
  const [luggage, setLuggage] = useState(0);
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [vehicleId, setVehicleId] = useState<Id<"vehicles"> | null>(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const submitLock = useRef(false);
  const form = useRef<HTMLFormElement>(null);
  const vehicles = useQuery(api.jobs.listVehicles);
  const quote = useQuery(
    api.jobs.getBookingQuote,
    vehicleId && startDate && endDate
      ? { vehicleId, startDate, endDate, serviceType, pickupTime, returnTime }
      : "skip",
  );
  const ensureUser = useMutation(api.users.ensureCurrentUser);
  const createBooking = useMutation(api.jobs.createBooking);
  const airport = serviceType.startsWith("airport");
  const selected = vehicles?.find((v) => v._id === vehicleId);
  const eligible = vehicles?.filter(
    (v) =>
      (!v.serviceType || ["rental", "chauffeur"].includes(v.serviceType)) &&
      (!v.seats || v.seats >= passengers) &&
      (serviceType === "self_drive"
        ? !v.driverIncluded
        : v.driverIncluded || (v.driverRate ?? 0) > 0),
  );

  function next() {
    if (!form.current?.reportValidity()) return;
    if (step === 1 && endDate <= startDate) {
      setError("Choose a return date after your pickup date.");
      return;
    }
    if (step === 3 && (!vehicleId || !quote?.available)) {
      setError(quote?.error ?? "Choose an available vehicle to continue.");
      return;
    }
    setError("");
    setStep((s) => Math.min(4, s + 1));
  }

  async function submit() {
    if (submitLock.current || !vehicleId || !quote?.price || !isAuthenticated)
      return;
    submitLock.current = true;
    setSubmitting(true);
    setError("");
    try {
      await ensureUser();
      const bookingId = await createBooking({
        vehicleId,
        serviceType,
        startDate,
        endDate,
        pickupTime,
        returnTime,
        pickupLocation,
        dropoffLocation,
        flightNumber: airport ? flightNumber : undefined,
        passengers,
        luggage,
        contactName,
        contactPhone,
        expectedTotal: quote.price.totalAmount,
      });
      router.push(`/trips?booking=${bookingId}`);
    } catch (cause) {
      setError(
        cause instanceof ConvexError
          ? String(cause.data)
          : "The request could not be saved. Availability or pricing may have changed. Review the quote and try again.",
      );
      submitLock.current = false;
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 md:px-6 py-8 md:py-12 max-w-3xl">
        <h1 className="text-3xl font-bold text-foreground md:text-5xl mb-2">
          Book Your Ride
        </h1>
        <p className="text-lg text-secondary mb-8">
          Choose your trip, review the price, and send a booking request.
        </p>
        <ol
          className="flex justify-between gap-2 mb-8"
          aria-label="Booking progress"
        >
          {STEPS.map((label, i) => (
            <li
              key={label}
              aria-current={step === i ? "step" : undefined}
              className="flex flex-col items-center gap-2 text-xs"
            >
              <span
                className={`h-10 w-10 rounded-full flex items-center justify-center font-bold border-2 ${step >= i ? "bg-primary text-primary-foreground border-primary" : "bg-white text-secondary border-border"}`}
              >
                {i + 1}
              </span>
              {label}
            </li>
          ))}
        </ol>
        <form
          ref={form}
          onSubmit={(e) => {
            e.preventDefault();
            if (step < 4) next();
            else void submit();
          }}
          className="bg-white rounded-2xl border border-border shadow-xl p-6 md:p-8 space-y-5"
        >
          <fieldset disabled={submitting} className="space-y-4">
            <legend className="text-xl font-bold mb-4">{STEPS[step]}</legend>
            {step === 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {SERVICES.map((option) => (
                  <button
                    type="button"
                    key={option.key}
                    aria-pressed={serviceType === option.key}
                    onClick={() => {
                      setServiceType(option.key);
                      setVehicleId(null);
                    }}
                    className={`p-6 rounded-xl border-2 text-left hover:border-primary ${serviceType === option.key ? "border-primary bg-primary/5" : "border-border"}`}
                  >
                    <option.icon className="h-8 w-8 mb-3 text-primary" />
                    <div className="font-semibold mb-1">{option.label}</div>
                    <p className="text-sm text-secondary">
                      {option.description}
                    </p>
                  </button>
                ))}
              </div>
            )}
            {step === 1 && (
              <>
                <label className="block text-sm font-medium">
                  Pickup address{" "}
                  {serviceType === "airport_pickup" && "(airport and terminal)"}
                  <Input
                    required
                    maxLength={500}
                    value={pickupLocation}
                    onChange={(e) => setPickupLocation(e.target.value)}
                    className="mt-2 h-12"
                  />
                </label>
                <label className="block text-sm font-medium">
                  Drop-off address{" "}
                  {serviceType === "airport_dropoff" &&
                    "(airport and terminal)"}
                  <Input
                    required
                    maxLength={500}
                    value={dropoffLocation}
                    onChange={(e) => setDropoffLocation(e.target.value)}
                    className="mt-2 h-12"
                  />
                </label>
                {airport && (
                  <>
                    <label className="block text-sm font-medium">
                      Flight number
                      <Input
                        required
                        maxLength={30}
                        placeholder="e.g. KL 589"
                        value={flightNumber}
                        onChange={(e) => setFlightNumber(e.target.value)}
                        className="mt-2 h-12"
                      />
                    </label>
                    <p className="text-sm text-secondary">
                      Airport transport currently uses daily vehicle hire rates.
                      Reserve the vehicle through the following day; fixed
                      transfer fares and flight tracking are not yet available.
                    </p>
                  </>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="text-sm font-medium">
                    Pickup date
                    <Input
                      required
                      type="date"
                      min={new Date().toISOString().slice(0, 10)}
                      value={startDate}
                      onChange={(e) => {
                        setStartDate(e.target.value);
                        setVehicleId(null);
                      }}
                      className="mt-2 h-12"
                    />
                  </label>
                  <label className="text-sm font-medium">
                    Pickup time (Ghana)
                    <Input
                      required
                      type="time"
                      value={pickupTime}
                      onChange={(e) => setPickupTime(e.target.value)}
                      className="mt-2 h-12"
                    />
                  </label>
                  <label className="text-sm font-medium">
                    Return date
                    <Input
                      required
                      type="date"
                      min={startDate}
                      value={endDate}
                      onChange={(e) => {
                        setEndDate(e.target.value);
                        setVehicleId(null);
                      }}
                      className="mt-2 h-12"
                    />
                  </label>
                  <label className="text-sm font-medium">
                    Return time (Ghana)
                    <Input
                      required
                      type="time"
                      value={returnTime}
                      onChange={(e) => setReturnTime(e.target.value)}
                      className="mt-2 h-12"
                    />
                  </label>
                </div>
                <p className="text-sm text-secondary">
                  Pickup and return calendar days are reserved exclusively for
                  your trip.
                </p>
              </>
            )}
            {step === 2 && (
              <>
                <label className="block text-sm font-medium">
                  Passenger name
                  <Input
                    required
                    maxLength={150}
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="mt-2 h-12"
                  />
                </label>
                <label className="block text-sm font-medium">
                  Phone number
                  <Input
                    required
                    type="tel"
                    maxLength={40}
                    placeholder="+233…"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="mt-2 h-12"
                  />
                </label>
                <label className="block text-sm font-medium">
                  Passengers
                  <Input
                    required
                    type="number"
                    min={1}
                    max={60}
                    value={passengers}
                    onChange={(e) => {
                      setPassengers(Number(e.target.value));
                      setVehicleId(null);
                    }}
                    className="mt-2 h-12"
                  />
                </label>
                <label className="block text-sm font-medium">
                  Luggage items
                  <Input
                    required
                    type="number"
                    min={0}
                    max={30}
                    value={luggage}
                    onChange={(e) => setLuggage(Number(e.target.value))}
                    className="mt-2 h-12"
                  />
                </label>
                <p className="text-sm text-secondary">
                  The owner will confirm luggage capacity and any driver
                  assignment before accepting.
                </p>
              </>
            )}
            {step === 3 && (
              <>
                {vehicles === undefined ? (
                  <p role="status">Loading vehicles…</p>
                ) : eligible?.length === 0 ? (
                  <p>
                    No vehicles match your service and passenger count. Go back
                    to adjust your trip.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {eligible?.map((vehicle) => (
                      <button
                        type="button"
                        key={vehicle._id}
                        aria-pressed={vehicleId === vehicle._id}
                        onClick={() => {
                          setVehicleId(vehicle._id);
                          setError("");
                        }}
                        className={`p-4 rounded-xl border-2 text-left ${vehicleId === vehicle._id ? "border-primary bg-primary/5" : "border-border"}`}
                      >
                        {vehicle.images[0] ? (
                          <Image
                            src={vehicle.images[0]}
                            alt={vehicle.title}
                            width={600}
                            height={360}
                            unoptimized
                            className="aspect-video w-full rounded-lg object-cover mb-3 bg-slate-100"
                          />
                        ) : (
                          <Car className="h-8 w-8 text-primary mb-3" />
                        )}
                        <div className="font-semibold">{vehicle.title}</div>
                        <p className="text-sm text-secondary">
                          {vehicle.city} ·{" "}
                          {vehicle.seats ?? "Contact owner for"} seats
                        </p>
                        <p className="text-sm font-bold mt-2">
                          {money(vehicle.pricePerDay)} / day
                        </p>
                        <p className="text-xs mt-1">
                          {vehicle.driverIncluded
                            ? "Driver included"
                            : vehicle.driverRate
                              ? `Driver: ${money(vehicle.driverRate)} / day extra`
                              : "Self drive"}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
                {vehicleId && (
                  <p role="status" className="text-sm">
                    {quote === undefined
                      ? "Checking dates and pricing…"
                      : quote.available
                        ? `Available for your dates. Total: ${money(quote.price.totalAmount)}`
                        : quote.error}
                  </p>
                )}
              </>
            )}
            {step === 4 && (
              <>
                <p className="font-semibold">
                  {selected?.title} ·{" "}
                  {SERVICES.find((s) => s.key === serviceType)?.label}
                </p>
                <p className="text-sm">
                  {pickupLocation} → {dropoffLocation}
                </p>
                <p className="text-sm text-secondary">
                  {startDate} at {pickupTime} to {endDate} at {returnTime}{" "}
                  (Ghana time)
                </p>
                {quote?.price ? (
                  <dl className="p-4 rounded-xl bg-slate-50 space-y-3">
                    {[
                      ["Vehicle hire", quote.price.subtotal],
                      ["Driver", quote.price.driverFee],
                      ["Service fee (5%)", quote.price.serviceFee],
                      ["Security deposit", quote.price.securityDeposit],
                      ["Total", quote.price.totalAmount],
                    ].map(([label, value]) => (
                      <div className="flex justify-between gap-4" key={label}>
                        <dt>{label}</dt>
                        <dd className="font-semibold">
                          {money(Number(value))}
                        </dd>
                      </div>
                    ))}
                  </dl>
                ) : (
                  <p role="alert">{quote?.error ?? "Checking your quote…"}</p>
                )}
                <p className="text-sm text-secondary">
                  This sends a request to the vehicle owner. Your trip is not
                  confirmed and no payment is collected at this stage.
                </p>
                {isLoading ? (
                  <p role="status">Checking sign-in…</p>
                ) : !isAuthenticated ? (
                  <p>
                    <Link
                      href="/sign-in"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline"
                    >
                      Sign in to request your booking
                    </Link>
                    . Return to this tab to keep your entered details.
                  </p>
                ) : null}
              </>
            )}
          </fieldset>
          {error && (
            <p role="alert" className="text-red-700 text-sm">
              {error}
            </p>
          )}
          <div className="flex justify-between gap-4 pt-4">
            <Button
              type="button"
              variant="ghost"
              disabled={step === 0 || submitting}
              onClick={() => {
                setStep((s) => s - 1);
                setError("");
              }}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <Button
              type="submit"
              disabled={
                submitting ||
                (step === 4 && (!isAuthenticated || !quote?.available))
              }
            >
              {submitting
                ? "Sending request…"
                : step === 4
                  ? "Request Booking"
                  : "Continue"}
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
