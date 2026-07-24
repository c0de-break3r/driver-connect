# Driver Map — Google Maps Migration Plan

## Goal
Replace MapLibre with Google Maps on the driver map tab, matching the provided image reference UI, and introduce a dedicated Zustand store for map/location state.

## Current State
- `map.tsx` uses `@maplibre/maplibre-react-native` (native) + `maplibre-gl` (web)
- No dedicated map/location Zustand store; state is local in `map.tsx`
- `@vis.gl/react-google-maps` and `react-native-maps` are installed but unused
- `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` exists in `.env`
- Custom `Animated.View` bottom sheet is used instead of a library

## Target State
- Google Maps on both native and web
- `useDriverMapStore` manages location, online status, ride-request state
- UI matches image reference: muted map style, profile avatar top-left, "0 More request" status pill, Stay Online bottom sheet with Refresh / Leader Board / Trip Request buttons, left menu button, right control buttons
- MapLibre fully removed

## Decision: Libraries to Add
- **`@gorhom/bottom-sheet`**: Replaces the custom animated bottom sheet. It provides native-feeling swipe gestures, better accessibility, and less custom animation code. It's the standard choice for this pattern in React Native.
- **`react-native-google-places-autocomplete`**: Provides the required Google Places search bar with minimal custom code. Note: this package is unmaintained since 2022; if installation fails, fallback is a manual `TextInput` + Google Places REST call.

Both require user approval per AGENTS.md before installation.

## Task List

### 1. Install and remove dependencies
- Remove: `@maplibre/maplibre-react-native`, `maplibre-gl`
- Add: `@gorhom/bottom-sheet`, `react-native-google-places-autocomplete`
- Run `bun install` and delete any non-bun lockfile if present

### 2. Remove MapLibre from native config
- Remove the `@maplibre/maplibre-react-native` plugin block from `app.json`
- Delete any MapLibre-related config entries

### 3. Create map style constant
- Create `src/lib/mapStyle.ts` exporting a muted Google Maps style JSON array
- Use low-saturation roads, light land features, minimal POIs to match the reference "muted standard" look

### 4. Create driver map Zustand store
- Create `src/store/useDriverMapStore.ts`
- State: `driverLocation` (`LatLng | null`), `isOnline` (`boolean`), `rideRequests` (array), `searchQuery` (`string`), `selectedDestination` (`LatLng | null`)
- Actions: `setDriverLocation`, `toggleOnline`, `addRideRequest`, `acceptRideRequest`, `declineRideRequest`, `setSearchQuery`, `setSelectedDestination`
- Persist `isOnline` via AsyncStorage; keep location transient

### 5. Rewrite `map.tsx`
- **Native path**: Use `MapView` from `react-native-maps` with `provider={PROVIDER_GOOGLE}`, `customMapStyle` from `mapStyle.ts`, and `GoogleMap` markers for driver + nearby drivers
- **Web path**: Use `@vis.gl/react-google-maps` (`GoogleMap`, `Marker`, `Polyline`) with the same muted style
- **Location**: Use `expo-location` + `useDriverMapStore` to track position; watch position when online
- **Search bar**: Integrate `react-native-google-places-autocomplete` (native) and equivalent web search using the Google Places API; store result in `selectedDestination`
- **Route visualization**: Draw a `Polyline` / direction line between driver location and selected destination
- **Nearby drivers**: Render animated markers for simulated nearby drivers based on driver location
- **Header controls**: Profile avatar (top-left, 20px from edge), menu button (left), traffic + location-center buttons (right)
- **Status pill**: "0 More request" pill above bottom sheet
- **Bottom sheet**: Replace custom `Animated.View` with `@gorhom/bottom-sheet`; content: "Stay Online" heading, subtitle, and 3 action buttons (Refresh, Leader Board, Trip Request)
- **Online/offline toggle**: Map current GO ONLINE button behavior to the new bottom sheet / status pill interaction
- Keep existing haptics and animations where they match the new structure

### 6. Update routing and guards
- Ensure `location-permission.tsx` still routes to dashboard after permission grant
- No changes needed to `_layout.tsx` tab registration

### 7. Validate
- Run `bun run typecheck`
- Run `bun run lint`
- Fix any errors before finishing

## Files Changed
- `app.json`
- `package.json`
- `src/app/(driver)/(tabs)/map.tsx` (rewrite)
- `src/store/useDriverMapStore.ts` (new)
- `src/lib/mapStyle.ts` (new)

## Out of Scope
- Real backend matching engine (remains mocked)
- Convex schema changes for map data
- Advanced gesture handling beyond standard bottom sheet behavior
- Deep linking or map sharing

## Open Question
- **Google Maps API key exposure**: The key is currently in `.env` as `EXPO_PUBLIC_*`, which bundles it into the client. For production, this should move to a backend proxy. For this learning project, keeping it client-side is acceptable, but I want to confirm you're aware and okay with that.
