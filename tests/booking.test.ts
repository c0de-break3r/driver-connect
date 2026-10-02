import { describe, expect, test } from "bun:test";
import {
  assertTransition,
  calculatePrice,
  overlaps,
  parseDate,
  validateDates,
} from "../convex/lib/bookingRules";
import {
  createBooking,
  getBooking,
  getRenterBookings,
  updateBookingStatus,
  createAvailabilityBlock,
  approveTripChangeRequest,
} from "../convex/jobs";

const vehicle = {
  _id: "vehicle1",
  ownerId: "owner1",
  status: "active",
  pricePerDay: 100.25,
  securityDeposit: 200,
  minimumRentDays: 1,
  driverRate: 50,
  advanceNotice: 0,
  instantBook: true,
  seats: 4,
};
const args = {
  vehicleId: "vehicle1",
  startDate: "2090-01-01",
  endDate: "2090-01-03",
  pickupLocation: "Accra",
  dropoffLocation: "Tema",
  serviceType: "self_drive",
};

// Execute real mutation/query handlers against a small DB fixture. This tests business logic,
// not Convex's transaction scheduler; simultaneous request testing needs a deployed test backend.
function fixture(subject: string | null = "renter-clerk") {
  const rows: Record<string, Record<string, unknown>[]> = {
    users: [
      { _id: "renter1", clerkUserId: "renter-clerk" },
      { _id: "owner1", clerkUserId: "owner-clerk" },
      { _id: "other1", clerkUserId: "other-clerk" },
    ],
    vehicles: [{ ...vehicle }],
    bookings: [],
    availabilityBlocks: [],
    tripChangeRequests: [],
  };
  const ctx = {
    auth: { getUserIdentity: async () => (subject ? { subject } : null) },
    db: {
      get: async (id: string) =>
        Object.values(rows)
          .flat()
          .find((row) => row._id === id) ?? null,
      query: (table: string) => {
        let values = rows[table];
        const query = {
          withIndex: (
            _name: string,
            fn: (q: {
              eq: (key: string, value: unknown) => unknown;
            }) => unknown,
          ) => {
            fn({
              eq: (key, value) => {
                values = values.filter((row) => row[key] === value);
                return null;
              },
            });
            return query;
          },
          collect: async () => values,
          unique: async () => values[0] ?? null,
          first: async () => values[0] ?? null,
        };
        return query;
      },
      insert: async (table: string, value: Record<string, unknown>) => {
        const id = `${table}${rows[table].length + 1}`;
        rows[table].push({ ...value, _id: id });
        return id;
      },
      patch: async (id: string, patch: Record<string, unknown>) => {
        const row = Object.values(rows)
          .flat()
          .find((r) => r._id === id);
        Object.assign(row!, patch);
      },
    },
  };
  return { ctx, rows };
}
function invoke(fn: unknown, ctx: unknown, input: unknown) {
  return (
    fn as { _handler: (ctx: unknown, args: unknown) => Promise<unknown> }
  )._handler(ctx, input);
}

describe("pricing and dates", () => {
  test("calculates GHS amounts in pesewas and retains the 5% fee", () => {
    expect(calculatePrice(vehicle, 2, "self_drive")).toEqual({
      subtotal: 200.5,
      driverFee: 0,
      serviceFee: 10.03,
      securityDeposit: 200,
      totalAmount: 410.53,
      currency: "GHS",
      days: 2,
    });
    expect(calculatePrice(vehicle, 2, "with_driver").totalAmount).toBe(510.53);
    expect(
      calculatePrice({ ...vehicle, driverIncluded: true }, 2, "with_driver")
        .driverFee,
    ).toBe(0);
  });
  test("rejects impossible dates, past dates, reversed dates and invalid prices", () => {
    expect(() => parseDate("2090-02-30")).toThrow();
    expect(() => parseDate("tomorrow")).toThrow();
    expect(() => validateDates("2000-01-01", "2000-01-02")).toThrow();
    expect(() => validateDates("2090-01-03", "2090-01-01")).toThrow();
    expect(() =>
      calculatePrice({ ...vehicle, pricePerDay: NaN }, 1, "self_drive"),
    ).toThrow();
  });
  test("enforces minimum duration and driver offering", () => {
    expect(() =>
      calculatePrice({ ...vehicle, minimumRentDays: 3 }, 2, "self_drive"),
    ).toThrow();
    expect(() =>
      calculatePrice({ ...vehicle, driverRate: undefined }, 2, "with_driver"),
    ).toThrow();
    expect(() =>
      calculatePrice({ ...vehicle, driverIncluded: true }, 2, "self_drive"),
    ).toThrow();
  });
  test("reserves both boundary days", () => {
    expect(
      overlaps("2090-01-01", "2090-01-03", "2090-01-03", "2090-01-05"),
    ).toBe(true);
    expect(
      overlaps("2090-01-01", "2090-01-03", "2090-01-04", "2090-01-05"),
    ).toBe(false);
  });
});

describe("booking API security and lifecycle", () => {
  test("requires authentication and rejects impersonation", async () => {
    await expect(
      invoke(createBooking, fixture(null).ctx, args),
    ).rejects.toThrow("sign in");
    await expect(
      invoke(createBooking, fixture().ctx, { ...args, renterId: "other1" }),
    ).rejects.toThrow("own account");
  });
  test("stores a server price snapshot and leaves payments pending", async () => {
    const { ctx, rows } = fixture();
    await invoke(createBooking, ctx, {
      ...args,
      subtotal: 1,
      driverFee: 99,
      serviceFee: 0,
      securityDeposit: 0,
      currency: "USD",
      instantBook: true,
    });
    expect(rows.bookings[0]).toMatchObject({
      renterId: "renter1",
      subtotal: 200.5,
      totalAmount: 410.53,
      currency: "GHS",
      status: "pending",
      paymentStatus: "pending",
    });
  });
  test("rejects stale or tampered total", async () => {
    await expect(
      invoke(createBooking, fixture().ctx, { ...args, expectedTotal: 1 }),
    ).rejects.toThrow("price has changed");
  });
  test("prevents duplicate and overlapping requests", async () => {
    const { ctx } = fixture();
    await invoke(createBooking, ctx, args);
    await expect(invoke(createBooking, ctx, args)).rejects.toThrow(
      "unavailable",
    );
  });
  test("blocks active trips and owner-unavailable dates", async () => {
    for (const status of ["pending", "accepted", "confirmed", "active"]) {
      const { ctx, rows } = fixture();
      rows.bookings.push({ ...args, status });
      await expect(invoke(createBooking, ctx, args)).rejects.toThrow(
        "unavailable",
      );
    }
    const { ctx, rows } = fixture();
    rows.availabilityBlocks.push({ ...args });
    await expect(invoke(createBooking, ctx, args)).rejects.toThrow(
      "unavailable",
    );
  });
  test("cancelled requests release dates", async () => {
    const { ctx, rows } = fixture();
    const id = await invoke(createBooking, ctx, args);
    await invoke(updateBookingStatus, ctx, {
      bookingId: id,
      status: "cancelled",
    });
    await invoke(createBooking, ctx, args);
    expect(rows.bookings.length).toBe(2);
  });
  test("rejects third-party booking reads and cancellation", async () => {
    const { ctx, rows } = fixture("other-clerk");
    rows.bookings.push({
      ...args,
      _id: "b1",
      renterId: "renter1",
      status: "pending",
    });
    await expect(invoke(getBooking, ctx, { bookingId: "b1" })).rejects.toThrow(
      "cannot access",
    );
    await expect(
      invoke(getRenterBookings, ctx, { renterId: "renter1" }),
    ).rejects.toThrow("cannot access");
    await expect(
      invoke(updateBookingStatus, ctx, {
        bookingId: "b1",
        status: "cancelled",
      }),
    ).rejects.toThrow("cannot access");
  });
  test("only owner can accept; payment is required to confirm", async () => {
    expect(() =>
      assertTransition("pending", "accepted", "renter", false),
    ).toThrow();
    expect(() =>
      assertTransition("pending", "accepted", "owner", false),
    ).not.toThrow();
    expect(() =>
      assertTransition("accepted", "confirmed", "owner", false),
    ).toThrow("payment");
    expect(() =>
      assertTransition("completed", "active", "owner", true),
    ).toThrow();
  });
  test("protects calendar blocks and rejects overlapping owner blocks", async () => {
    await expect(
      invoke(createAvailabilityBlock, fixture().ctx, {
        ...args,
        ownerId: "renter1",
      }),
    ).rejects.toThrow("owner");
    const { ctx, rows } = fixture("owner-clerk");
    rows.bookings.push({ ...args, status: "accepted" });
    await expect(
      invoke(createAvailabilityBlock, ctx, { ...args, ownerId: "owner1" }),
    ).rejects.toThrow("overlap");
  });
  test("trip change approval cannot bypass repricing", async () => {
    const { ctx, rows } = fixture("owner-clerk");
    rows.bookings.push({
      ...args,
      _id: "b1",
      renterId: "renter1",
      status: "pending",
    });
    rows.tripChangeRequests.push({
      _id: "c1",
      bookingId: "b1",
      type: "extend",
      status: "pending",
      requestedEndDate: "2090-02-01",
    });
    await expect(
      invoke(approveTripChangeRequest, ctx, { requestId: "c1" }),
    ).rejects.toThrow("new quote");
  });
});
