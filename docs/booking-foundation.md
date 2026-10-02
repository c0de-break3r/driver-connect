# Driver Connect: booking foundation

Implemented on the existing `dev` architecture: Next.js, Expo, Clerk and Convex. This is the first development milestone, not a production launch.

## Implemented

- Web service/journey/passenger/vehicle/review flow reads active Convex inventory instead of demo vehicles.
- Self-drive, vehicle-with-driver, airport pickup and airport drop-off requests have explicit service types. Airport requests collect a flight number and addresses. Airport transport currently uses daily vehicle hire, with a return date after pickup; no fixed transfer fare or flight tracking is implied.
- Server quotes validate dates, advance notice, rental duration, driver offering, price data and availability. Quotes use GHS, integer pesewas internally, the existing 5% rental service fee and an itemized deposit. Any partial additional 24-hour period is charged as another day.
- Creation derives the renter from the authenticated Clerk identity, recalculates prices, rejects stale totals, and checks availability again inside the same Convex mutation as insertion. Vehicle-indexed reads participate in Convex transaction conflict detection.
- Requests reserve both pickup and return calendar days. Pending, accepted, confirmed and active bookings block new requests. Cancellation releases unpaid requests. No automatic expiry yet.
- My Trips displays actual authenticated customer records with unpaid request cancellation. Legacy mobile APIs remain callable, but supplied identity/pricing are verified or ignored in favor of authoritative values.
- Owner-only vehicle changes and availability blocks, participant-only booking reads, controlled status transitions and restrictions on unsafe trip changes.
- Web uses Clerk sign-in/sign-up components and authenticated Convex provider. Mobile's fabricated auth token is replaced with Clerk's real integration; profile synchronization waits for Convex authentication.
- Mobile quotes now use the same server calculation. Booking success copy no longer claims payment or confirmation before either exists. Shared mobile button supports its existing React-node children.
- Root Convex dependency is declared, and web lint runs ESLint instead of removed `next lint`.

## Deliberate boundaries

Booking status starts at `pending`; payment status starts at `pending`. A request is not a confirmed trip. There is no payment collection, escrow, cash settlement, commission ledger, refund or payout implementation in this milestone. Paid booking cancellations require support; dates/driver changes require a new quote and currently fail with a clear message rather than modifying financial terms silently.

The owner may accept/reject through the secured status API. Full web owner, driver and admin dashboards remain future work. Driver assignment, driver schedule locking, document verification, approval gates, booking hold expiry, price/rule version snapshots, operational notifications and production-wide access-control auditing remain necessary. An active listing is not proof that its documents are verified. Other existing marketing/browse pages still contain demo content and must be connected before launch.

## Configuration required for a real end-to-end test

1. Copy `web/.env.example` to `web/.env.local` and configure the existing project's Convex URL, Clerk publishable key and Clerk secret key through secure environment settings.
2. In Clerk, configure the `convex` JWT template with audience `convex`. Set `CLERK_JWT_ISSUER_URL` in the matching Convex deployment. Web Clerk v5 uses this template; no major Clerk upgrade was performed.
3. Mobile needs `EXPO_PUBLIC_CONVEX_URL` and `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` pointing at the same environment.
4. From the repository root, run `bun install`, then `bunx convex dev` for a development deployment. Review schema changes before production deployment. New booking fields are optional for legacy data.
5. Use real test identities for owner and renter, create an active rental vehicle with valid rates and availability, then run `bun run dev:web`.
6. Request a trip, inspect its saved prices/status, reload My Trips, try an overlapping request from a second account, cancel the unpaid request, and confirm the dates become available. Verify another account cannot read or change the booking. Test owner acceptance independently from payment confirmation.

Do not merge/deploy to production until that flow, mobile compatibility and the remaining access-control/payment work are verified.

## Verification in this change

- `bun test tests`: 14 tests pass. Exercises actual booking handlers using an in-memory database fixture: authentication, impersonation, authoritative prices, stale quotes, overlaps, active bookings, calendar blocks, private reads, cancellation, lifecycle and trip-change restrictions; also date/currency rules. It does not test Convex's live concurrent transaction scheduler or a real Clerk session.
- `bun run --cwd web typecheck`: passes, including imported Convex backend types.
- `bun run --cwd web lint`: passes with 22 unused-code warnings in existing marketing/browse files.
- Web production build: compilation and TypeScript passed; prerendering stopped at the explicit missing `NEXT_PUBLIC_CONVEX_URL` check. Clerk environment values are also absent. No fake keys were used to claim a successful build.
- Root lint and mobile typecheck: still fail on existing mobile issues, including component contracts, missing Expo module imports, styles and lint resolver/configuration problems. The shared button fix removes many original component errors; remaining mobile issues are outside this milestone.
- No live deployment or browser end-to-end verification was performed because the required service configuration is absent.

Technical reference: https://docs.convex.dev/auth/clerk and https://docs.convex.dev/database/advanced/occ.

## Next milestones

1. Connect/configure development services and complete live booking verification; resolve remaining mobile checks.
2. Build web owner booking management, driver job acceptance and admin approval/verification flows.
3. Add Paystack initialization and signature-verified, idempotent webhooks with a payment ledger, refunds and payout accounting.
4. Implement dedicated airport transfer pricing, same-day time windows, driver matching, notifications and reservation expiry.
5. Complete all-table authorization review, remove remaining public demo data, run browser/mobile acceptance testing, then prepare a controlled Ghana launch.
