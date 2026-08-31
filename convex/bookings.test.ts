/// <reference types="vite/client" />
import { convexTest } from "convex-test";
import { expect, test } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";
import type { Id } from "./_generated/dataModel";

const modules = import.meta.glob("./**/*.ts");

function identity(subject: string) {
  return {
    subject,
    issuer: "https://clerk.test",
    tokenIdentifier: `https://clerk.test|${subject}`,
  };
}

const CLIENT = "user_client_1";
const CORPORATE = "user_corporate_1";
const OWNER = "user_owner_1";
const OTHER_OWNER = "user_owner_2";
const DRIVER = "user_driver_1";
const OTHER_DRIVER = "user_driver_2";
const OTHER_CLIENT = "user_client_2";

type Role = "driver" | "owner" | "client" | "corporate";

async function seedUser(
  t: ReturnType<typeof convexTest>,
  clerkUserId: string,
  role: Role,
) {
  return await t.run(async (ctx) => {
    return await ctx.db.insert("users", {
      clerkUserId,
      role,
      firstName: role,
      onboardingComplete: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  });
}

async function seedVehicle(
  t: ReturnType<typeof convexTest>,
  ownerId: string,
  instantBook: boolean,
) {
  return await t.run(async (ctx) => {
    return await ctx.db.insert("vehicles", {
      ownerId,
      title: "Test Camry",
      category: "Car",
      make: "Toyota",
      model: "Camry",
      year: 2022,
      hasAc: true,
      hasGps: false,
      features: [],
      images: ["https://example.com/car.jpg"],
      pricePerDay: 200,
      securityDeposit: 500,
      minimumRentDays: 1,
      city: "Accra",
      region: "Greater Accra",
      status: "active",
      isFeatured: false,
      rating: 0,
      reviewCount: 0,
      totalBookings: 0,
      instantBook,
      unlimitedDistance: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  });
}

function bookingArgs(vehicleId: Id<"vehicles">) {
  return {
    vehicleId,
    startDate: "2026-09-10",
    endDate: "2026-09-12",
    pickupLocation: "Accra Airport",
    dropoffLocation: "Kumasi",
    subtotal: 400,
    driverFee: 0,
    serviceFee: 20,
    securityDeposit: 500,
    totalAmount: 920,
    currency: "GHS",
  };
}

async function setupInstantBook() {
  const t = convexTest(schema, modules);
  await seedUser(t, CLIENT, "client");
  await seedUser(t, CORPORATE, "corporate");
  await seedUser(t, OWNER, "owner");
  await seedUser(t, OTHER_OWNER, "owner");
  await seedUser(t, DRIVER, "driver");
  await seedUser(t, OTHER_DRIVER, "driver");
  await seedUser(t, OTHER_CLIENT, "client");
  const vehicleId = await seedVehicle(t, OWNER, true);
  return { t, vehicleId };
}

async function setupRequestToBook() {
  const t = convexTest(schema, modules);
  await seedUser(t, CLIENT, "client");
  await seedUser(t, OWNER, "owner");
  await seedUser(t, DRIVER, "driver");
  await seedUser(t, OTHER_CLIENT, "client");
  const vehicleId = await seedVehicle(t, OWNER, false);
  return { t, vehicleId };
}

test("unauthenticated createBooking is refused", async () => {
  const { t, vehicleId } = await setupInstantBook();
  await expect(
    t.mutation(api.jobs.createBooking, bookingArgs(vehicleId)),
  ).rejects.toThrow(/Unauthenticated request/);
});

test("owner and driver cannot create a booking", async () => {
  const { t, vehicleId } = await setupInstantBook();
  await expect(
    t.withIdentity(identity(OWNER)).mutation(api.jobs.createBooking, bookingArgs(vehicleId)),
  ).rejects.toThrow(/Only clients and corporate accounts/);
  await expect(
    t.withIdentity(identity(DRIVER)).mutation(api.jobs.createBooking, bookingArgs(vehicleId)),
  ).rejects.toThrow(/Only clients and corporate accounts/);
});

test("client cannot book their own vehicle", async () => {
  const t = convexTest(schema, modules);
  await seedUser(t, CLIENT, "client");
  const vehicleId = await seedVehicle(t, CLIENT, true);
  await expect(
    t.withIdentity(identity(CLIENT)).mutation(api.jobs.createBooking, bookingArgs(vehicleId)),
  ).rejects.toThrow(/cannot book your own vehicle/);
});

test("instant-book path: create → sandbox pay → complete", async () => {
  const { t, vehicleId } = await setupInstantBook();
  const asClient = t.withIdentity(identity(CLIENT));
  const asOwner = t.withIdentity(identity(OWNER));

  const bookingId = await asClient.mutation(api.jobs.createBooking, bookingArgs(vehicleId));
  const created = await asClient.query(api.jobs.getBooking, { bookingId });
  expect(created).toMatchObject({
    renterId: CLIENT,
    status: "pending",
    paymentStatus: "pending",
    instantBook: true,
  });

  await asClient.mutation(api.jobs.confirmPayment, { bookingId });
  const paid = await asClient.query(api.jobs.getBooking, { bookingId });
  expect(paid).toMatchObject({
    status: "confirmed",
    paymentStatus: "paid",
  });

  await asOwner.mutation(api.jobs.completeBooking, { bookingId });
  const completed = await asClient.query(api.jobs.getBooking, { bookingId });
  expect(completed).toMatchObject({
    status: "completed",
    paymentStatus: "paid",
  });
});

test("corporate renter can complete the same lifecycle", async () => {
  const { t, vehicleId } = await setupInstantBook();
  const asCorporate = t.withIdentity(identity(CORPORATE));

  const bookingId = await asCorporate.mutation(api.jobs.createBooking, bookingArgs(vehicleId));
  await asCorporate.mutation(api.jobs.confirmPayment, { bookingId });
  await asCorporate.mutation(api.jobs.completeBooking, { bookingId });

  const completed = await asCorporate.query(api.jobs.getBooking, { bookingId });
  expect(completed).toMatchObject({
    renterId: CORPORATE,
    status: "completed",
    paymentStatus: "paid",
  });
});

test("request-to-book requires owner accept after payment", async () => {
  const { t, vehicleId } = await setupRequestToBook();
  const asClient = t.withIdentity(identity(CLIENT));
  const asOwner = t.withIdentity(identity(OWNER));

  const bookingId = await asClient.mutation(api.jobs.createBooking, bookingArgs(vehicleId));
  await asClient.mutation(api.jobs.confirmPayment, { bookingId });

  const awaitingOwner = await asClient.query(api.jobs.getBooking, { bookingId });
  expect(awaitingOwner).toMatchObject({
    status: "pending",
    paymentStatus: "paid",
    instantBook: false,
  });

  await expect(
    asClient.mutation(api.jobs.completeBooking, { bookingId }),
  ).rejects.toThrow(/Only confirmed bookings can be completed/);

  await asOwner.mutation(api.jobs.acceptBooking, { bookingId });
  const confirmed = await asOwner.query(api.jobs.getBooking, { bookingId });
  expect(confirmed).toMatchObject({ status: "confirmed", paymentStatus: "paid" });

  await asClient.mutation(api.jobs.completeBooking, { bookingId });
  const completed = await asOwner.query(api.jobs.getBooking, { bookingId });
  expect(completed).toMatchObject({ status: "completed", paymentStatus: "paid" });
});

test("owner can decline a pending request-to-book", async () => {
  const { t, vehicleId } = await setupRequestToBook();
  const asClient = t.withIdentity(identity(CLIENT));
  const asOwner = t.withIdentity(identity(OWNER));

  const bookingId = await asClient.mutation(api.jobs.createBooking, bookingArgs(vehicleId));
  await asOwner.mutation(api.jobs.declineBooking, { bookingId });
  const declined = await asOwner.query(api.jobs.getBooking, { bookingId });
  expect(declined).toMatchObject({ status: "cancelled" });
});

test("renter cannot spoof owner accept/decline", async () => {
  const { t, vehicleId } = await setupRequestToBook();
  const asClient = t.withIdentity(identity(CLIENT));
  const bookingId = await asClient.mutation(api.jobs.createBooking, bookingArgs(vehicleId));
  await asClient.mutation(api.jobs.confirmPayment, { bookingId });

  await expect(
    asClient.mutation(api.jobs.acceptBooking, { bookingId }),
  ).rejects.toThrow(/Only the vehicle owner can accept/);
  await expect(
    asClient.mutation(api.jobs.declineBooking, { bookingId }),
  ).rejects.toThrow(/Only the vehicle owner can decline/);
});

test("other owner cannot accept someone else's booking", async () => {
  const { t, vehicleId } = await setupRequestToBook();
  await seedUser(t, OTHER_OWNER, "owner");
  const asClient = t.withIdentity(identity(CLIENT));
  const bookingId = await asClient.mutation(api.jobs.createBooking, bookingArgs(vehicleId));
  await asClient.mutation(api.jobs.confirmPayment, { bookingId });

  await expect(
    t.withIdentity(identity(OTHER_OWNER)).mutation(api.jobs.acceptBooking, { bookingId }),
  ).rejects.toThrow(/Only the vehicle owner can accept this booking/);
});

test("attached driver cannot complete someone else's trip", async () => {
  const { t, vehicleId } = await setupInstantBook();
  const asClient = t.withIdentity(identity(CLIENT));
  const asDriver = t.withIdentity(identity(DRIVER));

  const bookingId = await asClient.mutation(api.jobs.createBooking, bookingArgs(vehicleId));
  await asClient.mutation(api.jobs.confirmPayment, { bookingId });
  await asClient.mutation(api.jobs.attachDriver, {
    bookingId,
    driverUserId: DRIVER,
  });

  await expect(
    asDriver.mutation(api.jobs.completeBooking, { bookingId }),
  ).rejects.toThrow(/Drivers cannot complete someone else's trip/);

  const driverJobs = await asDriver.query(api.jobs.getDriverBookings, {
    driverId: DRIVER,
  });
  expect(driverJobs).toHaveLength(1);
  expect(driverJobs[0]._id).toBe(bookingId);
});

test("driver cannot attach themselves to another user's booking", async () => {
  const { t, vehicleId } = await setupInstantBook();
  const asClient = t.withIdentity(identity(CLIENT));
  const bookingId = await asClient.mutation(api.jobs.createBooking, bookingArgs(vehicleId));

  await expect(
    t.withIdentity(identity(DRIVER)).mutation(api.jobs.attachDriver, {
      bookingId,
      driverUserId: DRIVER,
    }),
  ).rejects.toThrow(/Only the renter or vehicle owner can attach a driver/);
});

test("getBooking does not leak another user's booking", async () => {
  const { t, vehicleId } = await setupInstantBook();
  const asClient = t.withIdentity(identity(CLIENT));
  const bookingId = await asClient.mutation(api.jobs.createBooking, bookingArgs(vehicleId));

  await expect(
    t.query(api.jobs.getBooking, { bookingId }),
  ).rejects.toThrow(/Unauthenticated request/);

  await expect(
    t.withIdentity(identity(OTHER_CLIENT)).query(api.jobs.getBooking, { bookingId }),
  ).rejects.toThrow(/Booking not found/);
});

test("role-home lists do not leak other users' bookings", async () => {
  const { t, vehicleId } = await setupInstantBook();
  const otherVehicleId = await seedVehicle(t, OTHER_OWNER, true);

  const asClient = t.withIdentity(identity(CLIENT));
  const asOtherClient = t.withIdentity(identity(OTHER_CLIENT));
  const asOwner = t.withIdentity(identity(OWNER));
  const asOtherOwner = t.withIdentity(identity(OTHER_OWNER));

  const mine = await asClient.mutation(api.jobs.createBooking, bookingArgs(vehicleId));
  const theirs = await asOtherClient.mutation(
    api.jobs.createBooking,
    bookingArgs(otherVehicleId),
  );

  const clientList = await asClient.query(api.jobs.getRenterBookings, {
    renterId: CLIENT,
  });
  expect(clientList.map((row) => row._id)).toEqual([mine]);

  await expect(
    asClient.query(api.jobs.getRenterBookings, { renterId: OTHER_CLIENT }),
  ).rejects.toThrow(/Forbidden/);

  const ownerList = await asOwner.query(api.jobs.getOwnerBookings, {
    ownerId: OWNER,
  });
  expect(ownerList.map((row) => row._id)).toEqual([mine]);

  const otherOwnerList = await asOtherOwner.query(api.jobs.getOwnerBookings, {
    ownerId: OTHER_OWNER,
  });
  expect(otherOwnerList.map((row) => row._id)).toEqual([theirs]);
});

test("confirmPayment cannot be called by a non-renter", async () => {
  const { t, vehicleId } = await setupInstantBook();
  const asClient = t.withIdentity(identity(CLIENT));
  const bookingId = await asClient.mutation(api.jobs.createBooking, bookingArgs(vehicleId));

  await expect(
    t.withIdentity(identity(OWNER)).mutation(api.jobs.confirmPayment, { bookingId }),
  ).rejects.toThrow(/Only the renter can record payment/);
  await expect(
    t.withIdentity(identity(OTHER_CLIENT)).mutation(api.jobs.confirmPayment, { bookingId }),
  ).rejects.toThrow(/Only the renter can record payment/);
});

test("createBooking stores the signed-in user, not a client-supplied renter", async () => {
  const { t, vehicleId } = await setupInstantBook();
  const asClient = t.withIdentity(identity(CLIENT));
  const bookingId = await asClient.mutation(api.jobs.createBooking, bookingArgs(vehicleId));
  const booking = await asClient.query(api.jobs.getBooking, { bookingId });
  expect(booking?.renterId).toBe(CLIENT);
  expect(booking?.renterId).not.toBe(OTHER_CLIENT);
});
