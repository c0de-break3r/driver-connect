export type UserRole = "driver" | "owner" | "client" | "corporate";

export type BookingStatus = 
  | "draft"
  | "requested"
  | "pending"
  | "accepted"
  | "confirmed"
  | "active"
  | "completed"
  | "rejected"
  | "cancelled"
  | "expired"
  | "disputed";

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded" | "partially_refunded";

export type VehicleStatus = "active" | "paused" | "rented" | "maintenance" | "inactive";

export type VerificationStatus = "not_started" | "pending" | "verified" | "rejected";

export type MessageStatus = "sent" | "delivered" | "read";

export type NotificationChannel = "push" | "sms" | "email";

export type NotificationCategory = 
  | "trip_account"
  | "messages"
  | "recommendations"
  | "offers"
  | "news";

export type ReviewStatus = "not_reviewed" | "available" | "submitted";

export type AvailabilityBlockReason = "maintenance" | "personal" | "other";

export type TripChangeRequestType = "extend" | "shorten" | "change_pickup" | "change_dropoff" | "add_driver";

export type TripChangeRequestStatus = "pending" | "approved" | "declined";

export type RecommendationType = "recent_search" | "similar_vehicle" | "trending";
