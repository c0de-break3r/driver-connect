import { useEffect, useRef } from "react";
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
    api.users.getByUserId,
    isSignedIn && userId ? { userId } : "skip"
  );

  const upsertUser = useMutation(api.users.upsert);
  const syncedUserId = useRef<string | null>(null);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !userId) {
      return;
    }

    if (syncedUserId.current === userId && convexUser) {
      return;
    }

    const roleStore = useRoleStore.getState();
    const currentRole = roleStore.role;

    if (convexUser) {
      if (convexUser.role && convexUser.role !== currentRole) {
        setRole(convexUser.role);
      }
      syncedUserId.current = userId;
      return;
    }

    if (currentRole) {
      syncedUserId.current = userId;
      upsertUser({
        userId,
        role: currentRole,
        onboardingComplete: roleStore.onboardingComplete,
      }).catch(() => {
        // non-blocking: Convex may not be reachable yet during local dev setup
      });
    }
  }, [isLoaded, isSignedIn, userId, convexUser, setRole, upsertUser]);
}
