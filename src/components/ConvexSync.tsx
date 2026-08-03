import { useEffect, useCallback, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { useAuth } from "@/contexts/AuthProvider";
import { useRoleStore } from "@/store/useRoleStore";
import { useAppStateStore } from "@/store/useAppStateStore";
import { api } from "@/lib/convexApi";

export function ConvexSync() {
  const { userId, email, firstName, isLoaded, signedIn } = useAuth();
  const role = useRoleStore((state) => state.role);
  const setRole = useRoleStore((state) => state.setRole);
  const onboardingComplete = useRoleStore((state) => state.onboardingComplete);
  const setOnboardingComplete = useRoleStore((state) => state.setOnboardingComplete);
  const notificationsEnabled = useAppStateStore((state) => state.notificationsEnabled);
  const setNotificationsEnabled = useAppStateStore((state) => state.setNotificationsEnabled);
  const profileSetupComplete = useAppStateStore((state) => state.profileSetupComplete);
  const setProfileSetupComplete = useAppStateStore((state) => state.setProfileSetupComplete);
  const avatarUri = useAppStateStore((state) => state.avatarUri);
  const setAvatarUri = useAppStateStore((state) => state.setAvatarUri);
  const syncedUserIdRef = useRef<string | null>(null);
  const syncedEmailRef = useRef<string | null>(null);

  const convexUser = useQuery(
    (api.users as any).getByEmail,
    isLoaded && signedIn && email ? { email } : "skip"
  );

  const upsertUser = useMutation((api.users as any).upsert);

  const syncToConvex = useCallback(async () => {
    if (!isLoaded || !signedIn || !userId || !email) return;

    try {
      await upsertUser({
        userId,
        role: role || "client",
        firstName: firstName || undefined,
        email,
        onboardingComplete,
        notificationsEnabled,
        profileSetupComplete,
        avatarUri: avatarUri || undefined,
      });
      syncedUserIdRef.current = userId;
      syncedEmailRef.current = email;
    } catch (error) {
      console.error("Failed to sync user to Convex:", error);
    }
  }, [isLoaded, signedIn, userId, email, role, firstName, onboardingComplete, notificationsEnabled, profileSetupComplete, avatarUri, upsertUser]);

  useEffect(() => {
    if (!isLoaded) return;
    if (!signedIn) return;
    if (!userId || !email) return;

    const timeout = setTimeout(() => {
      syncToConvex();
    }, 150);

    return () => clearTimeout(timeout);
  }, [isLoaded, signedIn, userId, email, syncToConvex]);

  useEffect(() => {
    if (!isLoaded) return;

    const prevUserId = syncedUserIdRef.current;
    const currentUserId = userId || null;

    if (currentUserId && prevUserId && currentUserId !== prevUserId) {
      setRole(null);
      setOnboardingComplete(false);
      setNotificationsEnabled(true);
      setProfileSetupComplete(false);
      setAvatarUri(null);
    }

    if (currentUserId) {
      syncedUserIdRef.current = currentUserId;
    }
  }, [isLoaded, userId, setRole, setOnboardingComplete, setNotificationsEnabled, setProfileSetupComplete, setAvatarUri]);

  useEffect(() => {
    if (!convexUser) return;

    if (convexUser.role && convexUser.role !== role) {
      setRole(convexUser.role);
    }
    if (convexUser.onboardingComplete !== onboardingComplete) {
      setOnboardingComplete(convexUser.onboardingComplete);
    }
    if (convexUser.notificationsEnabled !== undefined && convexUser.notificationsEnabled !== notificationsEnabled) {
      setNotificationsEnabled(convexUser.notificationsEnabled);
    }
    if (convexUser.profileSetupComplete !== undefined && convexUser.profileSetupComplete !== profileSetupComplete) {
      setProfileSetupComplete(convexUser.profileSetupComplete);
    }
    if (convexUser.avatarUri && convexUser.avatarUri !== avatarUri && !avatarUri) {
      setAvatarUri(convexUser.avatarUri);
    }
    syncedEmailRef.current = email || syncedEmailRef.current;
  }, [convexUser, role, onboardingComplete, notificationsEnabled, profileSetupComplete, avatarUri, email, setRole, setOnboardingComplete, setNotificationsEnabled, setProfileSetupComplete, setAvatarUri]);

  return null;
}
