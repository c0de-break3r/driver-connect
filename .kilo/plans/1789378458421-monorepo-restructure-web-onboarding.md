# Driver Connect — Monorepo Restructure + Web App + Complete Tech Stack + Onboarding Plan

## 1. Context & Decisions

**Product**: Driver Connect — a vehicle/driver transport marketplace with four roles (driver, owner, client, corporate).

**Stack decisions (confirmed)**:
- Mobile: Expo SDK 57 + React Native + NativeWind v5 + Expo Router + Clerk + Convex
- Web: Next.js 16 (App Router) + Clerk + Convex (same backend)
- Repo: Monorepo with `mobile/`, `web/`, `packages/` using Bun workspaces + Turborepo
- Shared: TypeScript packages for types, constants, validation
 - Deploy: Convex (existing deployment — use Convex migrations for schema changes, preserve all data), Vercel (new web project), EAS (mobile)
- Onboarding: Full detailed flow per AGENTS.md (~15-20 screens)
- Web: Interactive marketing site with full booking capability (like myairportpickup.com)
- UI Design: Create new Stitch design system from scratch; Stitch screens are the visual source of truth
- **Maps/Location**: Google Maps Platform (Maps + Places + Distance Matrix) — valid API key with all required APIs enabled
- Identity Verification: WithPersona
- Payments: Paystack (Mobile Money + Cards) — existing account with API keys
- Notifications: OneSignal (already partially integrated)
- Web reference: https://myairportpickup.com — inspect thoroughly and replicate core patterns for Driver Connect web app

## 2. Complete Tech Stack

### 2.1 Mobile (Expo)
- **Framework**: Expo SDK 57, React Native 0.86
- **Navigation**: Expo Router (file-system routing)
- **Styling**: NativeWind v5 (Tailwind CSS v4 + tailwindcss-animate)
- **State**: Zustand + AsyncStorage
- **Auth**: Clerk (`@clerk/expo` / `@clerk/nextjs`) — existing instance with multiple providers configured
- **Backend**: Convex (existing deployment with data — preserve deployment URL, schema changes require migrations)
- **Maps/Location**: `expo-location` + `react-native-maps` + Google Maps SDK (configured in app.json)
- **Place Search**: `react-native-google-places-autocomplete` or custom with Google Places API via Convex action
- **Identity Verification**: WithPersona SDK + Convex mutation to store verification status
- **Payments**: Paystack SDK via Convex action (never expose keys in app)
- **Notifications**: OneSignal (`react-native-onesignal`) + Expo Push
- **Haptics**: `expo-haptics`
- **Images**: `expo-image`
- **Video**: `expo-video`
- **Camera/Media**: `expo-image-picker`
- **Icons**: `lucide-react-native` + `@expo/vector-icons`
- **Animations**: `react-native-reanimated` + `react-native-worklets`
- **Gestures**: `react-native-gesture-handler`
- **Bottom Sheets**: `@gorhom/bottom-sheet`
- **Web support**: `expo-web-browser`

### 2.2 Web (Next.js)
- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS v4 + tailwindcss-animate
- **Auth**: `@clerk/nextjs`
- **Backend**: `convex/nextjs` or `convex/react`
- **Maps**: `@vis.gl/react-google-maps` (already in package.json)
- **Place Search**: Google Places API via Convex action or direct fetch
- **Identity Verification**: WithPersona web SDK + Convex mutation
- **Payments**: Paystack (`@paystack/paystack-sdk` or Paystack Checkout via Convex action)
- **Icons**: `lucide-react`
- **Animations**: Framer Motion (for web-specific animations)

### 2.3 Shared Packages
- `packages/shared-types`: TypeScript types for Vehicle, Booking, User, DriverProfile, etc.
- `packages/shared-constants`: Enums for vehicle categories, transmission types, fuel types, colors, occasion types
- `packages/ui`: Shared UI primitives if needed (Buttons, Cards, Badges) — optional, can use native UI libraries per platform

### 2.4 Backend (Convex)
- **Database**: Convex (all tables in `convex/schema.ts`)
- **Auth**: Clerk (identity from JWT)
- **File Storage**: Convex Storage (for document uploads, vehicle images)
- **Scheduled Jobs**: Convex Cron (for booking reminders, availability cleanup)
- **Email/Notifications**: Convex actions calling external APIs (SendGrid, OneSignal)
- **Payments**: Convex actions calling Stripe (server-side only)
- **Maps/Places**: Convex actions calling Google Maps/Places APIs (server-side to protect API keys)
- **Identity Verification**: Convex actions calling WithPersona API (server-side)
- **AI**: Convex agent (`@convex-dev/agent`) for trip description parsing, bio assistant

## 3. Third-Party Integrations

### 3.1 Google Maps Platform
- **Maps SDK**: Display maps on vehicle/driver detail pages
- **Places API**: Search/autocomplete for pickup/dropoff locations
- **Distance Matrix API**: Calculate trip distances and pricing
- **Geolocation**: Driver service area matching, proximity search
- **Implementation**: 
  - Mobile: `react-native-maps` with Google Maps provider (already configured in app.json)
  - Web: `@vis.gl/react-google-maps`
  - Server-side: Convex actions for Places autocomplete and Distance Matrix (protect API keys)

### 3.2 WithPersona
- **Purpose**: Identity verification for drivers and owners (ID document, selfie, police clearance)
- **Flow**:
  1. App requests verification session from Convex action
  2. Convex calls WithPersona API, returns session token
  3. Mobile/Web opens WithPersona SDK with session token
  4. User completes verification flow
  5. WithPersona webhook updates Convex database
  6. App polls or receives push notification of verification status
- **Storage**: Store verification status and document URLs in Convex `driverProfiles` and `ownerProfiles`

### 3.3 Paystack
- **Purpose**: Payments for bookings, security deposits, driver payouts (Ghana-focused)
- **Flow**:
  1. Client selects vehicle/driver → booking form
  2. Backend creates Paystack transaction via Convex action
  3. Client confirms payment with Paystack SDK or redirect
  4. Webhook updates Convex booking status
  5. Owners/drivers receive payouts via Paystack
- **Mobile**: Paystack React Native SDK or redirect flow
- **Web**: Paystack Checkout or inline payment
- **Security**: All Paystack operations happen in Convex actions; never expose secret keys in app

### 3.4 OneSignal
- **Purpose**: Push notifications for booking updates, messages, reminders
- **Already integrated** partially in mobile (`setupOneSignal`)
- **Web**: OneSignal web SDK for browser push notifications

### 3.5 Clerk
- **Purpose**: Authentication and user management
- **Mobile**: `@clerk/expo`
- **Web**: `@clerk/nextjs`
- **Features**: Email/password, Google OAuth, phone OTP (if enabled)
- **Webhooks**: Clerk webhooks to sync user data to Convex

## 4. Reference Site: myairportpickup.com

The web app should replicate core patterns from https://myairportpickup.com:
- Clean hero section with search form
- Vehicle/driver browsing with filters
- Detailed listing pages with pricing and availability
- Simple booking flow (dates → details → confirmation)
- Trust signals (reviews, ratings, verified badges)
- Mobile-responsive design
- Fast loading and clear CTAs

During Phase 6, inspect the reference site thoroughly and replicate its UX patterns.

## 5. Stitch Integration

### 5.1 Design System
- Use Stitch to create and maintain the design system
- Export design tokens (colors, typography, spacing) as CSS variables or JSON
- Generate screens from Stitch prompts, then export code
- Use Stitch's `designSystem` tool to apply consistent styling across screens

### 5.2 Workflow
1. Create design system in Stitch with brand colors, typography, shapes
2. Design onboarding screens in Stitch
3. Export screens as code and integrate into mobile/web
4. For future screens, use Stitch as the visual source of truth
5. Keep Stitch project ID in constants for reference

### 5.3 Implementation
- Mobile screens: Generated from Stitch, adapted for React Native/NativeWind
- Web pages: Generated from Stitch, adapted for Next.js/Tailwind
- Shared components: Create from Stitch designs, ensure cross-platform consistency

## 6. Data Model Additions

### 6.1 Verification (WithPersona)
Already partially in schema:
- `driverProfiles`: `verificationStatus`, `idDocumentUrl`, `selfieUrl`, `policeClearanceUrl`
- Need to add: `verificationStartedAt`, `verificationCompletedAt`, `personaInquiryId`

### 6.2 Payments (Paystack)
Already partially in schema:
- `bookings`: `paymentStatus`, `subtotal`, `driverFee`, `serviceFee`, `securityDeposit`, `totalAmount`, `currency`
- Need to add: `paystackTransactionId`, `paystackPayoutId`

### 6.3 Maps/Location
Already partially in schema:
- `vehicles`: `latitude`, `longitude`, `city`, `region`
- Need to add: `serviceAreaRadius` (in km) for driver/owner service areas

## 7. Updated AGENTS.md Changes

- Replace all "Africana Driver Connect" with "Driver Connect"
- Update project structure section to show monorepo layout
- Add web-specific rules (Next.js, Vercel, web booking)
- Add Stitch as UI design source of truth
- Add Google Maps/Places integration rules
- Add WithPersona verification flow
- Add Paystack payment rules
- Add monorepo/workspace notes
- Keep all existing engineering standards intact

## 8. Implementation Order

### Phase 1: Repo restructure (foundation)
1. Create `mobile/`, `web/`, `packages/` directories
2. Move Expo code to `mobile/`
3. Create `packages/shared-types` and `packages/shared-constants`
4. Update imports, tsconfig, package.json scripts
5. Verify mobile still runs: `bun run lint`, `bun run typecheck`, `bun start`
6. Update AGENTS.md (remove "Africana", add web/monorepo notes)
7. Document existing Convex schema and plan migrations for any required changes

### Phase 2: Shared packages + Stitch design system
7. Extract types from `convex/schema.ts` into `packages/shared-types`
8. Extract constants from data files into `packages/shared-constants`
9. Set up Stitch design system project
10. Wire up workspace dependencies in package.jsons

### Phase 3: Mobile onboarding + auth
11. Create `(auth)` route group with sign-in/sign-up screens (Clerk embedded)
12. Create `(onboarding)` route group with full flow per AGENTS.md
13. Implement onboarding state management and progress persistence
14. Wire auth → onboarding → role dashboard flow

### Phase 4: Mobile integrations
15. Integrate Google Places autocomplete for location pickers
16. Integrate WithPersona SDK for driver/owner verification
17. Integrate Paystack for payments
18. Complete booking flow with real Convex mutations

### Phase 5: Web foundation
19. Scaffold Next.js in `web/`
20. Set up Tailwind, Clerk (`@clerk/nextjs`), Convex client
21. Set up Google Maps web (`@vis.gl/react-google-maps`)
22. Set up WithPersona web SDK
23. Set up Stripe web
24. Create shared layout and navigation
25. Deploy to Vercel preview

### Phase 6: Web marketing + booking
26. Inspect https://myairportpickup.com thoroughly; document UX patterns to replicate
27. Build landing page (using Stitch designs + myairportpickup.com patterns)
28. Build browse/search pages (vehicles, drivers)
29. Build detail pages with Google Maps
30. Build booking flow (dates, details, confirmation)
31. Build trips page (authenticated)
32. Verify web ↔ Convex integration

### Phase 7: Polish
33. Run `bun run lint` and `bun run typecheck` across all packages
34. Test core flows: mobile onboarding → verification → booking, web browse → booking
35. Verify empty states, loading states, error handling
36. Accessibility pass on key screens
37. Final AGENTS.md review

## 9. Key Technical Decisions

| Decision | Rationale |
|----------|-----------|
| Monorepo | Single repo for mobile, web, shared packages; easier coordination |
| Turborepo | Fast builds, caching, task orchestration |
| Convex actions for Google/WithPersona/Paystack | Server-side only; never expose API keys in client |
| Stitch for UI | Visual source of truth; consistent design across platforms |
| Clerk for auth | Already integrated; supports email, Google, phone OTP |
| Next.js App Router | Modern React patterns; Server Components for performance |
| NativeWind v5 + tailwindcss-animate | Consistent styling across mobile/web; animation support |

## 10. Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| Moving files breaks imports | Use systematic search-replace; verify with typecheck |
| Convex path aliases break after restructure | Update tsconfig paths in both apps; test queries |
| Google Maps API costs | Use Convex actions to cache results; set usage limits |
| WithPersona webhook reliability | Implement retry logic in Convex; fallback polling |
| Paystack webhook security | Verify webhook signatures in Convex actions |
| NativeWind web compatibility | Test Tailwind classes in Next.js; use platform-specific utilities where needed |
| Stitch code export quality | Review and adapt generated code; don't blindly accept |

## 11. Remaining Open Questions

1. What is the exact Convex deployment URL? (Needed for mobile and web configuration)
2. What is the Vercel project name / domain for the web app?
3. What are the Paystack API keys (public/secret) and webhook configuration?
4. Do you have a WithPersona API key and webhook URL configured?
