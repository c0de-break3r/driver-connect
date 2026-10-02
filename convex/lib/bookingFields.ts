import { v } from "convex/values";
export const serviceValidator = v.union(
  v.literal("self_drive"),
  v.literal("with_driver"),
  v.literal("airport_pickup"),
  v.literal("airport_dropoff"),
);
export const bookingFields = {
  serviceType: v.optional(serviceValidator),
  flightNumber: v.optional(v.string()),
  passengers: v.optional(v.number()),
  luggage: v.optional(v.number()),
  contactName: v.optional(v.string()),
  contactPhone: v.optional(v.string()),
};
