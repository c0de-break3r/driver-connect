export type TimeSlot = {
  start: string;
  end: string;
  label: string;
};

export const DEFAULT_TIME_SLOTS: TimeSlot[] = [
  { start: "07:00", end: "12:30", label: "Morning" },
  { start: "13:00", end: "17:00", label: "Afternoon" },
  { start: "17:30", end: "21:00", label: "Evening" },
];

export type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed";

export type Booking = {
  id: string;
  driverId?: string;
  vehicleId?: string;
  date: string;
  slotStart: string;
  slotEnd: string;
  status: BookingStatus;
  userId: string;
  renterName?: string;
  createdAt: number;
};

export type WaitlistEntry = {
  id: string;
  driverId?: string;
  vehicleId?: string;
  date: string;
  slotStart: string;
  slotEnd: string;
  userId: string;
  position: number;
  createdAt: number;
  notified?: boolean;
};

export type SlotStatus = "available" | "booked" | "partial" | "waitlist";

export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

export function hasTimeOverlap(
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean {
  const s1 = timeToMinutes(start1);
  const e1 = timeToMinutes(end1);
  const s2 = timeToMinutes(start2);
  const e2 = timeToMinutes(end2);
  return s1 < e2 && e1 > s2;
}

export function getSlotStatus(
  bookings: Booking[],
  date: string,
  slotStart: string,
  slotEnd: string,
  resourceId: string,
  resourceType: "driver" | "vehicle"
): SlotStatus {
  const field = resourceType === "driver" ? "driverId" : "vehicleId";
  const dayBookings = bookings.filter(
    (b) =>
      b.date === date &&
      b[field] === resourceId &&
      b.status !== "cancelled" &&
      b.status !== "completed"
  );

  if (dayBookings.length === 0) return "available";

  for (const booking of dayBookings) {
    if (hasTimeOverlap(slotStart, slotEnd, booking.slotStart, booking.slotEnd)) {
      if (slotStart >= booking.slotStart && slotEnd <= booking.slotEnd) {
        return "booked";
      }
      return "partial";
    }
  }

  return "available";
}

export function getWaitlistPosition(
  waitlist: WaitlistEntry[],
  date: string,
  slotStart: string,
  userId: string,
  resourceId: string,
  resourceType: "driver" | "vehicle"
): number {
  const field = resourceType === "driver" ? "driverId" : "vehicleId";
  const entries = waitlist
    .filter((w) => w.date === date && w.slotStart === slotStart && w[field] === resourceId)
    .sort((a, b) => a.createdAt - b.createdAt);

  const index = entries.findIndex((e) => e.userId === userId);
  return index >= 0 ? index + 1 : 0;
}

export function isOnWaitlist(
  waitlist: WaitlistEntry[],
  date: string,
  slotStart: string,
  userId: string,
  resourceId: string,
  resourceType: "driver" | "vehicle"
): boolean {
  return (
    getWaitlistPosition(waitlist, date, slotStart, userId, resourceId, resourceType) > 0
  );
}
