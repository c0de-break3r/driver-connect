import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useAuth as useClerkAuth, useUser, useSignIn } from "@clerk/expo";

type AuthState = {
  userId: string | null;
  email: string | null;
  firstName: string | null;
  isLoaded: boolean;
  signedIn: boolean;
  signIn: (emailInput: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (emailInput: string, password: string, metadata?: Record<string, any>) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (emailInput: string) => Promise<{ error: Error | null }>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const clerkAuth = useClerkAuth();
  const { user } = useUser();
  const signInHook = useSignIn();
  const [userId, setUserId] = useState<string | null>(clerkAuth.userId ?? null);
  const [email, setEmail] = useState<string | null>(user?.primaryEmailAddress?.emailAddress ?? null);
  const [firstName, setFirstName] = useState<string | null>(user?.firstName ?? null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    setUserId(clerkAuth.userId ?? null);
    setEmail(user?.primaryEmailAddress?.emailAddress ?? null);
    setFirstName(user?.firstName ?? null);

    return () => {
      mountedRef.current = false;
    };
  }, [clerkAuth.userId, user?.primaryEmailAddress?.emailAddress, user?.firstName]);

  const signIn = async (emailInput: string, password: string) => {
    try {
      if (!signInHook.signIn) {
        return { error: new Error("Sign in not initialized") };
      }
      await signInHook.signIn.create({
        identifier: emailInput.trim(),
      });
      await signInHook.signIn.password({
        identifier: emailInput.trim(),
        password,
      });
      await signInHook.signIn.finalize();
      return { error: null };
    } catch (error) {
      return { error: error instanceof Error ? error : new Error("Sign in failed") };
    }
  };

  const signUp = async (emailInput: string, password: string, metadata?: Record<string, any>) => {
    try {
      if (!signInHook.signIn) {
        return { error: new Error("Sign in not initialized") };
      }
      await signInHook.signIn.create({
        identifier: emailInput.trim(),
        signUpIfMissing: true,
      });
      return { error: null };
    } catch (error) {
      return { error: error instanceof Error ? error : new Error("Sign up failed") };
    }
  };

  const signOut = async () => {
    await clerkAuth.signOut();
  };

  const resetPassword = async (emailInput: string) => {
    try {
      if (!signInHook.signIn) {
        return { error: new Error("Sign in not initialized") };
      }
      await signInHook.signIn.create({
        identifier: emailInput.trim(),
      });
      return { error: null };
    } catch (error) {
      return { error: error instanceof Error ? error : new Error("Password reset failed") };
    }
  };

  const value = useMemo<AuthState>(
    () => ({
      userId: clerkAuth.userId ?? null,
      email: user?.primaryEmailAddress?.emailAddress ?? null,
      firstName: user?.firstName ?? null,
      isLoaded: clerkAuth.isLoaded,
      signedIn: clerkAuth.isSignedIn ?? false,
      signIn,
      signUp,
      signOut,
      resetPassword,
    }),
    [clerkAuth.userId, user?.primaryEmailAddress?.emailAddress, clerkAuth.isLoaded, clerkAuth.isSignedIn, user?.firstName]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
