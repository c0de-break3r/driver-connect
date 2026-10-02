"use client";

import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { convex } from "@/lib/convex";

// Clerk v5 uses the named JWT template; it does not expose sessionClaims yet.
function useClerkConvexAuth() {
  return { ...useAuth(), sessionClaims: undefined };
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      signInFallbackRedirectUrl="/book"
      signUpFallbackRedirectUrl="/book"
    >
      <ConvexProviderWithClerk client={convex} useAuth={useClerkConvexAuth}>
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
