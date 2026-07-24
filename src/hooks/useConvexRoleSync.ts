import { useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { useRoleStore } from "@/store/useRoleStore";
import { api } from "@/lib/convexApi";

export type { UseConvexRoleSyncParams };

type UseConvexRoleSyncParams = {
  isLoaded: boolean;
  isSignedIn: boolean | undefined;
  userId: string | null | undefined;
};

export function useConvexRoleSync({
  isLoaded,
  isSignedIn,
  userId,
}: UseConvexRoleSyncParams) {
  const setRole = useRoleStore((s) => s.setRole);

  const convexUser = useQuery(
    api.users.getByClerkUserId,
    isSignedIn && userId ? { clerkUserId: userId } : "skip"
  );

  const upsertUser = useMutation(api.users.upsert);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !userId) {
      return;
    }

    const roleStore = useRoleStore.getState();
    const currentRole = roleStore.role;

    if (convexUser) {
      if (convexUser.role && convexUser.role !== currentRole) {
        setRole(convexUser.role);
      }
      return;
    }

    if (currentRole) {
      upsertUser({
        clerkUserId: userId,
        role: currentRole,
        onboardingComplete: roleStore.onboardingComplete,
      }).catch(() => {
        // non-blocking: Convex may not be reachable yet during local dev setup
      });
    }
  }, [isLoaded, isSignedIn, userId, convexUser, setRole, upsertUser]);
}
